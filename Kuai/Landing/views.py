import re
import json
import pytz
import time
import datetime
from django import forms
from django.urls import reverse
from  django.utils import timezone
from .models import Temp_Business, User, AccountManager
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import get_object_or_404, render, redirect
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from .models import waitData, capacityData, waitTimes, Capacity, validate_user, validate_pwd, Business


# format to handle requests and check for integers
# also filter data
def addWaitTime(request, ID, time):
    user = request.user
    if user.profile.wait_too_soon(ID): 
        print("Too Soon")
        return
    entry = waitData(business = ID, wait_time = time, author = request.user.username)
    entry.save()
    try:
        times = waitTimes.objects.get(business = ID)
        product = times.numReviews * times.average
        product += int(time)
        times.numReviews += 1
        times.average = product / times.numReviews
        times.last_update = timezone.utcnow()
        times.save()
    except ObjectDoesNotExist:
        times = waitTimes(business = ID, numReviews = 1, average = time)
        times.save()
    try:
        business = Business.objects.get(placeID = ID)
        if business.wait_time is None:
            business.wait_time = times
            business.save()
    except ObjectDoesNotExist:
        try:
            business = Temp_Business.objects.get(placeID = ID)
            if business.wait_time is None:
                business.wait_time = times
                business.save()
        except ObjectDoesNotExist:
            business = Temp_Business(placeID = ID)
            business.wait_time = times
            business.save()
    user.profile.last_time_update = entry
    user.profile.all_time_updates.add(entry)
    user.save()

# format to handle requests and check for integers
# also filter data
def addCapacity(request, ID, capacity):
    user = request.user
    if user.profile.capacity_too_soon(ID): 
        print("Too Soon")
        return
    entry = capacityData(business = ID, capacity = capacity, author = request.user.username)
    entry.save()
    try:
        capacities = Capacity.objects.get(business = ID)
        product = capacities.numReviews * capacities.average
        product += int(capacity)
        capacities.numReviews += 1
        capacities.average = product / capacities.numReviews
        capacities.last_update = timezone.utcnow()
        capacities.save()
    except ObjectDoesNotExist:
        capacities = Capacity(business = ID, numReviews = 1, average = capacity)
        capacities.save()
    try:
        business = Business.objects.get(placeID = ID)
        if business.capacity is None:
            business.capacity = capacities
            business.save()
    except ObjectDoesNotExist:
        try:
            business = Temp_Business.objects.get(placeID = ID)
            if business.capacity is None:
                business.capacity = capacities
                business.save()
        except ObjectDoesNotExist:
            business = Temp_Business(placeID = ID)
            business.capacity = capacities
            business.save()
    user.profile.last_capacity_update = entry
    user.profile.all_capacity_updates.add(entry)
    user.save()

# Queue Controls
'''def pricing(ID): # implement ML algo
    business = Business.objects.get(placeID = ID)
    wait_time = business.wait_time
    capacity = business.capacity # implement checks later; implement collection mechanism for old data
    queue = business.queue

    price = 1.0 + queue.premium

    time_percent = (wait_time.average / 180) # neg dif checks
    time_dif = float((pytz.utc.localize(datetime.datetime.now()) - wait_time.last_update.timestamp).total_seconds() / 60)
    time_dif_percent = (time_dif / 180) 
    time_weighted = abs(time_percent - time_dif_percent)

    capacity_dif = float((pytz.utc.localize(datetime.datetime.now()) - capacity.last_update.timestamp).total_seconds() / 60)
    capacity_dif_percent = (capacity_dif / 180) 
    capacity_weighted = abs(capacity.average - capacity_dif_percent)

    average = (time_weighted + capacity_weighted) / 2
    return price * (1 + average)'''
def pricing(ID):
    business = Business.objects.get(placeID = ID)
    wait_time = business.wait_time
    capacity = business.capacity
    queue = business.queue

    last_time = float((pytz.utc.localize(datetime.datetime.now()) - wait_time.last_update.timestamp).total_seconds() / 60)
    price = queue.premium + (.25 * (abs(wait_time.average - last_time))) # negatives have to be counted for

    last_cap = ((float((pytz.utc.localize(datetime.datetime.now()) - capacity.last_update.timestamp).total_seconds() / 60)) / 180)
    if (float(capacity.average / 100) - last_cap > .5): price *= (1 + float(capacity.average / 100) - last_cap)

    return price

# login form
class UserLoginForm(forms.Form):
    username = forms.CharField(label="Username: ", required=True, max_length=20)
    password = forms.CharField(label="Password: ", widget=forms.PasswordInput, max_length=20, required=True)

class RegisterForm(forms.Form):
    first_name = forms.CharField(label="First Name: ", required=True, max_length=20)
    last_name = forms.CharField(label="Last Name: ", required=True, max_length=20)
    email = forms.CharField(label="Email: ", required=True, widget=forms.EmailInput)
    username = forms.CharField(label="Username: ", required=True, max_length=20, validators=[validate_user])
    password = forms.CharField(label="Password: ", widget=forms.PasswordInput, max_length=20, required=True, validators=[validate_pwd])

# Create your views here.
def index(request):
    # same landing page; change top right display based on whether logged in or not
    # if request.user.is_authenticated:
    #     return HttpResponse("Hello authenticated!")
    # simple search handler
    return render(request, "Landing/landing.html")

# def search(request): 
#     query = request.GET.get('q', "")
#     if (query):
#         print(query)
#         pass
#     return render(request, "Landing/advanced_search.html", {"q" : query})
    
def business_view(request, ID):
    return render(request, "Landing/go.html") #temp link


def nearby_location_search(request):
    xcor = request.GET.get('xcor')
    ycor = request.GET.get('ycor')
    radius = request.GET.get('radius')
    if (xcor and ycor and radius > 0):
        pass #search

def go(request):
    print(request.method)
    if ( request.method == "POST"):
        # print(request.raw_post_data) // broken
        json_data = request.read()
        data = json.loads(json_data)
        # method_list = [method for method in dir(data) if method.startswith('_') is False]
        # print(method_list)
        # print(type(data))
        for i in data:
            # print(i) 
            if (i['placeID'] and not Business.objects.filter(placeID=i['placeID']).exists()):
                targetQuery = Temp_Business.objects.filter(placeID=i['placeID'])
                if targetQuery.exists():#temp busness if exist then update time
                    print('exists already')
                    tempBiz = targetQuery.get()
                    tempBiz.updateTime()
                else: # other wise create temp
                    print('creating tempBiz')
                    tempBiz = Temp_Business(xcor = i['coords']['lat'], ycor = i['coords']['lng'], placeID = i['placeID']) 
                    tempBiz.save()
                    pass

            else:
                continue #query busness => if exist exit        

        return HttpResponse("recieved")

    id = request.GET.get('id', "")
    query = request.GET.get('q', "")
    if (query):
        print(query)
        
    if (id):
        #we have id => create custom map
        print(id)
    
    return render(request, "Landing/go.html", {
        "target_id" : id,
        "q" : query,
    })

def login_view(request):
    if request.user.is_authenticated:
         return HttpResponseRedirect('/')
    # if request.method == 'POST':
    #     username = request.POST["username"]
    #     password = request.POST["password"]
    #     user = authenticate(request, username=username, password=password)
    #     if user is not None:
    #         login(request, user)
    #         return HttpResponseRedirect('/')
    return render(request, "Landing/login.html", {
        "form":UserLoginForm()
    })
@login_required(login_url='/accounts/login/')
def profile(request):
    current_user = request.user
    print(current_user.id)
    for attr, value in vars(current_user).items():
        print("Attribute: " + str(attr or ""))
        print("Value: " + str(value or ""))
        print(current_user.profile.birth_date)
    print(current_user._wrapped.username)
    return render(request, "Landing/profile.html")

# def login_view(request):
#     if request.user.is_authenticated:
#          return HttpResponseRedirect('/')
#     # if request.method == 'POST':
#     #     username = request.POST["username"]
#     #     password = request.POST["password"]
#     #     user = authenticate(request, username=username, password=password)
#     #     if user is not None:
#     #         login(request, user)
#     #         return HttpResponseRedirect('/')
#     return render(request, "Landing/login.html", {
#         "form":UserLoginForm()
#     })

# def logout_view(request):
#     if not request.user.is_authenticated:
#         return HttpResponseRedirect('/login')
#     logout(request)
#     return HttpResponseRedirect('/')

# def register_view(request):
#     if request.user.is_authenticated:
#         return HttpResponseRedirect('')
#     if request.method == 'POST':
#         first_name = request.POST["first_name"]
#         last_name = request.POST["last_name"]
#         email = request.POST["email"]
#         username = request.POST["username"]
#         password = request.POST["password"]
#         User.objects.create_user(username, email=email, password=password, first_name=first_name, last_name=last_name)
#         return HttpResponseRedirect('/')
#     return render(request, "Landing/register.html", {
#        "form":RegisterForm()
#     })


# Route an account view that passes all arguments to account template; also updates fave-businesses and maybe history; updates pic; figures out time of day

# test view for testing out html elements
def test(request, id):
    return render(request, "Landing/business_page.html", {
        "id":id
    })

# test view for testing out html elements
def test(request, placeID):
    business = Business.objects.filter(placeID = placeID)[0]
    wait_time = business.wait_time
    capacity = business.capacity
    return render(request, "Landing/business_page.html", {
        "business" : business,
        'wait_time' : wait_time,
        'capacity' : capacity
    })


def popup(request, placeID):
    business = Business.objects.filter(placeID = placeID)[0]
    price = pricing(placeID)            
    wait_time = business.wait_time
    return render(request, "Landing/popup.html", {
        'business' : business,
        'wait_time' : wait_time,
        'user' : request.user,
        'price' : price
    })

def userAccount(request):
    times = {0:"night", 1:"night",2:"night",3:"night",4:"night",5:"night",6:"morning",7:"morning",8:"morning",9:"morning",10:"morning",11:"morning",12:"day",13:"day",14:"day",15:"day",16:"day",17:"afternoon",18:"afternoon",19:"afternoon", 20:"afternoon", 21:"night", 22:"ngiht",23:"night",24:"night"}
    t = time.localtime()[3]
    return render(request, "Landing/userAccount.html", {
        "time" : times.get(time.localtime()[3]),
        "name" : request.user.username
    }
    )

def quickWaitTime(request):
    if request.method == 'POST':
        form = request.POST
        id = form["business"]
        time = form["time"]
        business = Business.objects.filter(placeID = id)[0]
        addWaitTime(request, id, time)
    return HttpResponseRedirect(f"/popup/{business.placeID}")

def longWaitTime(request):
    if request.method == 'POST':
        form = request.POST
        id = form['business']
        time = form['time']
        business = Business.objects.filter(placeID = id)[0]
        addWaitTime(request, id, time)
    return HttpResponseRedirect(f'/business_view/{business.placeID}')

def longCapacity(request):
    if request.method == 'POST':
        form = request.POST
        id = form['business']
        cap = form['cap']
        business = Business.objects.filter(placeID = id)[0]
        addCapacity(request, id, cap)
    return HttpResponseRedirect(f'/business_view/{business.placeID}')




#def a(request):


""" def skip(request):
    if request.user.profile.subscription_type == 'BASIC':
       # surge pricing
       message = "It appears you're not currently a Premium user. Would you like to make a one time payment or subscribe to our line-skipping, digital queue service?" 
    else:
        if (request.user.profile.skip_count > 0): """


#def verification_collection()