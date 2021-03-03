from django.shortcuts import get_object_or_404, render, redirect
from django.http import HttpResponse, HttpResponseRedirect
from django import forms
from django.contrib.auth import authenticate, login, logout
from django.core.exceptions import ValidationError
from .models import User, AccountManager
from .models import waitData, capacityData, waitTimes, Capacity, validate_user, validate_pwd
from django.urls import reverse
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
    return render(request, "landing/landing.html", {
        "authenticated" : request.user.is_authenticated
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

def logout_view(request):
    if not request.user.is_authenticated:
        return HttpResponseRedirect('/login')
    logout(request)
    return HttpResponseRedirect('/')

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
        return HttpResponseRedirect('/')
    return render(request, "Landing/register.html", {
       "form":RegisterForm()
    })

def autocomplete_view(request):
    if request.is_ajax():
        q = request.GET.get('term', '')
        search_qs = User.objects.filter(is_business=True).filter(business__startswith=q)
        results = []
        print(q)
        for r in search_qs:
            results.append(r.name)
        data = json.dumps(results) # what is json?
    else:
        data = 'fail'
    mimetype = 'application/json'
    return HttpResponse(data, mimetype)

def search(request): #redirect into go if only one result shows
    try:
        searchWord = request.POST['Main-Search'].strip().lower()
        print("recived post request, Search Word: "+ searchWord)
        search_qs = User.objects.filter(is_business=True).filter(business__startswith=searchWord)
        # if len(search_qs) = 1:
        # else 
        # if one object found move to map // other wise to more specific search
        found = get_object_or_404(search_qs, pk=1)
    except (KeyError): #nothing in input
        return render(request, 'Landing/index.html', {
            'error_message': "Put something to search for",
        })
    else:
        # Always return an HttpResponseRedirect after successfully dealing
        # with POST data. This prevents data from being posted twice if a
        # user hits the Back button
        return HttpResponseRedirect(reverse("Landing:go", args=(found.id,)))# go screen figure out how to not hard code later

def go(request, location_id):
    q = get_object_or_404(User,id=location_id)
    # return HttpResponse(q.business) // incorportate going to the business location later
    return render(request, "Landing/go.html", {
        # business location + name => start loading map
    })

# Route an account view that passes all arguments to account template; also updates fave-businesses and maybe history; updates pic; figures out time of day

# test view for testing out html elements
def test(request):
    return render(request, "Landing/navbar.html")