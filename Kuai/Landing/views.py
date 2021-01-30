from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django import forms
from django.contrib.auth import authenticate, login, logout
from django.core.exceptions import ValidationError
from .models import User, AccountManager
from .models import waitData, capacityData, waitTimes, Capacity, validate_user, validate_pwd
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
    if request.user.is_authenticated:
        return HttpResponse("Hello authenticated!")
    return HttpResponse("Hello world!")

def login_view(request):
    if request.user.is_authenticated:
        return HttpResponseRedirect(index)
    if request.method == 'POST':
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(index)
    return render(request, "landing/login.html", {
        "form":UserLoginForm()
    })

def logout_view(request):
    if not request.is_authenticated:
        return HttpResponseRedirect(login_view)
    logout(request)
    return HttpResponseRedirect(index)

def register_view(request):
    if request.user.is_authenticated:
        return HttpResponseRedirect('')
    if request.method == 'POST':
        first_name = request.POST["first_name"]
        last_name = request.POST["last_name"]
        email = request.POST["email"]
        username = request.POST["username"]
        password = request.POST["password"]
        User.objects.create_user(username, email=email, password=password, first_name=first_name, last_name=last_name)
        return HttpResponseRedirect(index)
    return render(request, "landing/register.html", {
       "form":RegisterForm()
    })