import re
import json
import pytz
import time
import datetime
from django import forms
from django.urls import reverse
from .models import Business, User, AccountManager
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import get_object_or_404, render, redirect
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from .models import waitData, validate_user, validate_pwd, Business

def business_exists(ID):
    try:
        business = Business.objects.get(placeID = ID)
        return business
    except ObjectDoesNotExist:
        try:
            business = Business.objects.get(placeID = ID)
            return business
        except ObjectDoesNotExist:
            business = Business(placeID = ID)
            business.save()
            return business


# # format to handle requests and check for integers
# # also filter data
# def addWaitTime(request, ID, time):
#     user = request.user
#     """ if user.profile.wait_too_soon(ID): 
#         print("Too Soon")
#         return """
#     business = business_exists(ID)
#     entry = waitData(business = business, wait_time = time, author = request.user)
#     entry.save()
#     try:
#         times = waitTimes.objects.get(business = business)
#         product = times.numReviews * times.average
#         product += int(time)
#         times.numReviews += 1
#         times.average = product / times.numReviews
#         times.save()
#     except ObjectDoesNotExist:
#             times = waitTimes(business = business, numReviews = 1, average = time)
#             times.save()
#     business.wait_time = times
#     business.save()
#     user.profile.last_time_update = entry
#     user.profile.alltime.add(entry)
#     user.save()
#     """ entry = waitData(business = ID, wait_time = time, author = request.user)
#     entry.save()
#     try:
#         times = waitTimes.objects.get(business = ID)
#         product = times.numReviews * times.average
#         product += int(time)
#         times.numReviews += 1
#         times.average = product / times.numReviews
#         times.save()
#     except ObjectDoesNotExist:
#         times = waitTimes(business = ID, numReviews = 1, average = time)
#         times.save()
#     try:
#         business = Business.objects.get(placeID = ID)
#         if business.wait_time is None:
#             business.wait_time = times
#             business.save()
#     except ObjectDoesNotExist:
#         try:
#             business = Business.objects.get(placeID = ID)
#             if business.wait_time is None:
#                 business.wait_time = times
#                 business.save()
#         except ObjectDoesNotExist:
#             business = Business(placeID = ID)
#             business.wait_time = times
#             business.save()
#     user.profile.last_time_update = entry
#     user.profile.all_time_updates.add(entry)
#     user.save() """

# # format to handle requests and check for integers
# # also filter data
# def addCapacity(request, ID, capacity):
#     user = request.user
#     if user.profile.capacity_too_soon(ID): 
#         print("Too Soon")
#         return
#     entry = capacityData(business = ID, capacity = capacity, author = request.user.username)
#     entry.save()
#     try:
#         capacities = Capacity.objects.get(business = ID)
#         product = capacities.numReviews * capacities.average
#         product += int(capacity)
#         capacities.numReviews += 1
#         capacities.average = product / capacities.numReviews
#         capacities.save()
#     except ObjectDoesNotExist:
#         capacities = Capacity(business = ID, numReviews = 1, average = capacity)
#         capacities.save()
#     try:
#         business = Business.objects.get(placeID = ID)
#         if business.capacity is None:
#             business.capacity = capacities
#             business.save()
#     except ObjectDoesNotExist:
#         try:
#             business = Business.objects.get(placeID = ID)
#             if business.capacity is None:
#                 business.capacity = capacities
#                 business.save()
#         except ObjectDoesNotExist:
#             business = Business(placeID = ID)
#             business.capacity = capacities
#             business.save()
#     user.profile.last_capacity_update = entry
#     user.profile.all_capacity_updates.add(entry)
#     user.save()


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
    return render(request, "Landing/landing.html")
    
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
            print(i) 
            if (i['placeID'] and not Business.objects.filter(placeID=i['placeID']).exists()):
                targetQuery = Business.objects.filter(placeID=i['placeID'])
                if targetQuery.exists():#temp busness if exist then update time
                    print('exists already')
                    Biz = targetQuery.get()
                    Biz.updateTime()
                else: # other wise create temp
                    print('creating Biz')
                    Biz = Business(lat = i['coords']['lat'], lon = i['coords']['lng'], placeID = i['placeID']) 
                    Biz.save()
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
    wait_time = business.wait_time
    return render(request, "Landing/popup.html", {
        'business' : business,
        'wait_time' : wait_time
    })

#def a(request):

def testing(request):
    return render(request, "Landing/popup.html", {

    })
""" def skip(request):
    if request.user.profile.subscription_type == 'BASIC':
       # surge pricing
       message = "It appears you're not currently a Premium user. Would you like to make a one time payment or subscribe to our line-skipping, digital queue service?" 
    else:
        if (request.user.profile.skip_count > 0): """


#def verification_collection()