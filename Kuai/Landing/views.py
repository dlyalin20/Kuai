from django.shortcuts import get_object_or_404, render, redirect
from django.http import HttpResponse, HttpResponseRedirect
from django import forms
from django.contrib.auth import authenticate, login, logout
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from .models import User, AccountManager
from .models import waitData, capacityData, waitTimes, Capacity, validate_user, validate_pwd
from django.urls import reverse
from django.contrib.auth.decorators import login_required
import json
import re
import time
import datetime
import pytz


# format to handle requests and check for integers
# also filter data
def addWaitTime(request, ID, time):
    user = request.user
    try:
        if int((pytz.utc.localize(datetime.datetime.now()) - user.profile.last_time_update.timestamp).total_seconds() / 60) < float(time) and user.profile.last_time_update.business == ID:
            print("Too Soon")
            return
    except AttributeError:
        pass
    entry = waitData(business = ID, wait_time = time, author = request.user.username)
    entry.save()
    try:
        times = waitTimes.objects.get(business = ID)
        product = times.numReviews * times.average
        product += int(time)
        times.numReviews += 1
        times.average = product / times.numReviews
        times.save()
    except ObjectDoesNotExist:
        times = waitTimes(business = ID, numReviews = 1, average = time)
        times.save()
    user.profile.last_time_update = entry
    user.save()

# format to handle requests and check for integers
# also filter data
def addCapacity(request, ID, capacity):
    user = request.user
    try:
        if int((pytz.utc.localize(datetime.datetime.now()) - user.profile.last_capacity_update.timestamp).total_seconds() / 60) and user.profile.last_capacity_update.business == ID:
            print("Too Soon")
            return
    except AttributeError:
        pass
    entry = capacityData(business = ID, capacity = capacity, author = request.user.username)
    entry.save()
    try:
        capacities = Capacity.objects.get(business = ID)
        product = capacities.numReviews * capacities.average
        product += int(capacity)
        capacities.numReviews += 1
        capacities.average = product / capacities.numReviews
        capacities.save()
    except ObjectDoesNotExist:
        capacities = Capacity(business = ID, numReviews = 1, average = capacity)
        capacities.save()
    user.profile.last_capacity_update = entry
    user.save()

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
    print('indexRequest')
    
    
    return render(request, "Landing/landing.html")

# def search(request): 
#     query = request.GET.get('q', "")
#     if (query):
#         print(query)
#         pass
#     return render(request, "Landing/advanced_search.html", {"q" : query})
    
def business_view(request, ID):
    return render(request, "Landing/go.html") #temp link


def go(request):
    print(request.method)
    if ( request.method == "POST"):
        # print(request.raw_post_data) // broken
        json_data = request.read()
        data = json.loads(json_data)
        if (data and data.length > 0):
            print(data) #get py array

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

def popup(request):
    return render(request, "Landing/popup.html")

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
        addWaitTime(request, id, time)
    return HttpResponseRedirect("/popup")
