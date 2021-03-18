from django.shortcuts import get_object_or_404, render, redirect
from django.http import HttpResponse, HttpResponseRedirect
from django import forms
from django.contrib.auth import authenticate, login, logout
from django.core.exceptions import ValidationError
from .models import User, AccountManager
from .models import waitData, capacityData, waitTimes, Capacity, validate_user, validate_pwd
from django.urls import reverse
from django.contrib.auth.decorators import login_required
import json
import re

# format to handle requests and check for integers
# also filter data
def addWaitTime(request, ID, time):
    entry = waitData(business = ID, wait_time = time, author = request.user.username)
    entry.save()
    try:
        times = waitTimes.objects.get(business = ID)
        product = times.numReviews * times.average
        product += time
        times.numReviews += 1
        times.average = product / times.numReviews
        times.save()
    except:
        times = waitTimes(business = ID, numReviews = 1, average = time)
        times.save()

# format to handle requests and check for integers
# also filter data
def addCapacity(request, ID, capacity):
    entry = capacityData(business = ID, capacity = capacity, author = request.user.username)
    entry.save()
    try:
        capacities = Capacity.objects.get(business = ID)
        product = capacities.numReviews * capacities.average
        product += capacity
        capacities.numReviews += 1
        capacities.average = product / capacities.numReviews
        capacities.save()
    except:
        capacities = Capacity(business = ID, numReviews = 1, average = capacity)
        capacities.save()



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

def search(request): 
    query = request.GET.get('q', "")
    if (query):
        print(query)
        pass
    return render(request, "Landing/advanced_search.html", {"q" : query})
    

def go(request):
    id = request.GET.get('id', "")
    if (id):
        #we have id => create custom map
        print(id)
        return render(request, "Landing/go.html", {
            "target_id" : id,
    })
    return render(request, "Landing/go.html", {
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
def test(request):
    return render(request, "Landing/navbar.html")
