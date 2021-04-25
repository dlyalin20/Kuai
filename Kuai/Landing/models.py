import re
import datetime
import collections
from django.db import models
from jsonfield import JSONField
from django.dispatch import receiver
from django.db.models.deletion import CASCADE
from django.db.models.signals import post_save
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.contrib.auth.models import User, PermissionsMixin, AbstractBaseUser, BaseUserManager
import django.utils
from django.contrib import admin
import PIL

# validators
def validate_user(user):
    if len(user) < 8 or len(user) > 20:
        raise ValidationError("Username must be between lengths 8 and 20, inclusive.")
    if len(re.findall("\s", user)) > 0:
        raise ValidationError("Username cannot contain whitespace characters.")
def validate_pwd(pwd):
    if len(pwd) <= 8 or len(pwd) > 20:
        raise ValidationError("Password must be between lengths 8 and 20, inclusive.")
    if len(re.findall("[0-9]", pwd)) == 0:
        raise ValidationError("Password must contain at least one numerical digit.")
    if len(re.findall("\W", pwd)) == 0:
        raise ValidationError("Password must contain at least one symbolic character.")
    if len(re.findall("\s", pwd)) > 0:
        raise ValidationError("Password cannot contain whitespace characters.")
    if len(re.findall("[a-zA-Z]", pwd)) == 0:
        raise ValidationError("Password must contain at least one alphabetic character.")

# Custom User

class AccountManager(BaseUserManager):
    def create_user(self, username, email, first_name, last_name, password):
        user = self.model(username=username, email=email, first_name=first_name, last_name=last_name, password=password)
        user.set_password(password)
        user.is_staff = False
        user.is_business = False
        user.is_superuser = False
        user.business = None
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, first_name, last_name, password):
        user = self.create_user(username=username, email=email, first_name=first_name, last_name=last_name, password=password)
        user.is_staff = True
        user.is_superuser = True
        user.is_business = True
        user.business = None
        user.save(using=self._db)
        return user

    def create_business(self, username, email, first_name, last_name, password, business):
        user = self.model(username=username, email=email, first_name=first_name, last_name=last_name, password=password)
        user.is_staff = True
        user.is_business = True
        user.business = business
        user.save(using=self._db)
        return user

    def create_staff(self, username, email, first_name, last_name, password, business):
        user = self.model(username=username, email=email, first_name=first_name, last_name=last_name, password=password)
        user.is_staff = True
        user.business = business
        user.save(using=self._db)
        return user
    
    def get_by_natural_key(self, username_):
        print(username_)
        return self.get(username=username_)

class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=40, unique=True, validators=[
        validate_user
    ])
    first_name = models.CharField(max_length=40)
    last_name = models.CharField(max_length=40)
    email = models.EmailField()
    is_business = models.BooleanField(default = False)
    is_staff = models.BooleanField(default = False)
    is_superuser = models.BooleanField(default = False)
    REQUIRED_FIELDS = ['email', 'first_name', 'last_name']
    USERNAME_FIELD = 'username'
    EMAIL_FIELD = 'email'

    objects = AccountManager()


    def get_short_name(self):
        return self.username

    def natural_key(self):
        return self.username
    
    def __str__(self):
        return self.username

class waitData(models.Model):
    business = models.CharField(max_length = 40, null = False, blank = False, unique = False)
    wait_time = models.FloatField(validators = [
        MinValueValidator(0),
        MaxValueValidator(180)
    ], null = False, blank = False)
    author = models.CharField(max_length = 20, null = False, blank = False)
    timestamp = models.DateTimeField(default = django.utils.timezone.now, null = False, blank = False,)

    REQUIRED_FIELDS = ['business', 'wait_time', 'author', 'timestamp']

    def get_short_name(self):
        return self.business

    def natural_key(self):
        return self.business
    
    def __str__(self):
        return self.business

class capacityData(models.Model):
    business = models.CharField(max_length = 40, null = False, blank = False, unique = False)
    capacity = models.FloatField(validators = [
        MinValueValidator(0),
        MaxValueValidator(100)
    ], null = False, blank = False)
    author = models.CharField(max_length = 20, null = False, blank = False)
    timestamp = models.DateTimeField(auto_now = True, null = False, blank = False)

    REQUIRED_FIELDS = ['business', 'capacity', 'author', 'timestamp']

    def get_short_name(self):
        return self.business

    def natural_key(self):
        return self.business
    
    def __str__(self):
        return self.business

# Custom User Profile
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=CASCADE, unique = True)
    latitude = models.IntegerField(null = True, blank = True, validators= [
        MinValueValidator(-90),
        MaxValueValidator(90)
    ])
    longitude = models.IntegerField(null = True, blank = True, validators = [
        MinValueValidator(-180),
        MaxValueValidator(180)
    ])
    birth_date = models.DateField(null = True, blank = True)
    profile_pic = models.ImageField(blank = True, null = True, upload_to='Landing/pfps')
    favorite_businesses = JSONField(null = True, blank = True) # Map each business to Name, Category (food, event, etc.), distance from user home point
    search_history = JSONField(null = True, blank = True) #store business name mapped with date/time searched
    all_time_updates = models.ManyToManyField(waitData, blank=True)
    all_capacity_updates = models.ManyToManyField(capacityData, blank=True)
    last_time_update = models.OneToOneField(waitData, null = True, blank = True, on_delete = models.SET_NULL)
    last_capacity_update = models.OneToOneField(capacityData, null = True, blank = True, on_delete = models.SET_NULL)

    @receiver(post_save, sender=User)
    def create_user_profile(sender, instance, created, **kwargs):
        if created and not instance.is_business and not instance.is_staff:
            Profile.objects.create(user = instance)
    
    @receiver(post_save, sender=User)
    def save_user_profile(sender, instance, **kwargs):
        instance.profile.save()

class waitTimes(models.Model):
    business = models.CharField(max_length = 40, null = False, blank = False, unique = True)
    numReviews = models.IntegerField(validators = [
        MinValueValidator(0)
    ], default = 0, null = False, blank = False)
    average = models.FloatField(validators = [
        MinValueValidator(0)
    ], default = 0, null = False, blank = False)
    REQUIRED_FIELDS = ['business', 'numReviews', 'average']

    def get_short_name(self):
        return self.business

    def natural_key(self):
        return self.business

    def __str__(self):
        return self.business

class Capacity(models.Model):
    business = models.CharField(max_length = 40, null = False, blank = False, unique = True)
    numReviews = models.IntegerField(validators = [
        MinValueValidator(0)
    ], default = 0, null = False, blank = False)
    average = models.FloatField(validators = [
        MinValueValidator(0),
        MaxValueValidator(100)
    ], default = 0, null = False, blank = False)
    
    REQUIRED_FIELDS = ['business', 'numReviews', 'average']

    def get_short_name(self):
        return self.business

    def natural_key(self):
        return self.business

    def __str__(self):
        return self.business

class Business(models.Model):
    name = models.CharField(max_length = 40, null = False, blank = False, unique = True)
    xcor = models.FloatField(null = False, blank = False)
    ycor = models.FloatField(null = False, blank = False)
    verified = models.BooleanField(default = False)
    wait_time = models.OneToOneField(waitTimes, null = True, blank = True, on_delete = models.SET_NULL, related_name = 'time')
    capacity = models.OneToOneField(Capacity, null = True, blank = True, on_delete = models.SET_NULL, related_name='cap')
    placeID = models.TextField(null = False, blank=False, unique = True, default = False)
    REQUIRED_FIELDS = ['name', 'xcor', 'ycor', 'verified']

    def get_short_name(self):
        return self.name

    def natural_key(self):
        return self.name

    def __str__(self):
        return self.name

class Business_Profile(models.Model):
    user = models.OneToOneField(User, on_delete=CASCADE, unique = True)
    businesses = models.ManyToManyField(Business, blank = True)

    REQUIRED_FIELDS = ['user']

    @receiver(post_save, sender=User)
    def create_business(sender, instance, created, **kwargs):
        if created and instance.is_business:
            Business_Profile.objects.create(user = instance)

    @receiver(post_save, sender=User)
    def save_business(sender, instance, **kwargs):
        instance.profile.save()

    def get_short_name(self):
        return self.user.username

    def natural_key(self):
        return self.user.username

    def __str__(self):
        return self.user.username


class Staff_Profile(models.Model):
    user = models.OneToOneField(User, on_delete=CASCADE, unique = True)
    staffof = models.OneToOneField(Business, null = False, blank = False, unique = False, on_delete = CASCADE)

    @receiver(post_save, sender=User)
    def create_staff(sender, instance, created, **kwargs):
        if created and instance.is_staff:
            Staff_Profile.objects.create(user = instance)

    @receiver(post_save, sender=User)
    def save_staff(sender, instance, **kwargs):
        instance.profile.save()

    def get_short_name(self):
        return self.user.username

    def natural_key(self):
        return self.user.username
    
    def __str__(self):
        return self.user.username

class Temp_Business_Manager(models.Manager):
    def search(self, latitude, longitude, radius):
        # find point around :
        query= "SELECT ID, NOM, LAT, LON, 3956 * 2 * ASIN(SQRT(POWER(SIN((%s - LAT) * 0.0174532925 / 2), 2) + COS(%s * 0.0174532925) * COS(LAT * 0.0174532925) * POWER(SIN((%s - LON) * 0.0174532925 / 2), 2) )) as distance from POI  having distance < 50 ORDER BY distance ASC " % ( latitude, latitude, longitude)
        return('test')


class Temp_Business(models.Model):
    lat = models.FloatField(blank = False, null = False)
    lon = models.FloatField(blank = False, null = False)
    verified = models.BooleanField(null = False, blank = False, default = False)
    cached_time = models.DateTimeField(auto_now = True, null = False, blank = False)
    wait_time = models.OneToOneField(waitTimes, null = True, blank = True, on_delete = CASCADE)
    capacity = models.OneToOneField(Capacity, null = True, blank = True, on_delete = CASCADE)
    placeID = models.TextField(null = False, blank=False, unique = True, default = False)
    REQUIRED_FIELDS = ['xcor', 'ycor', 'verified', 'placeID', "cached_time"]

    def twenty_days(self):
        return (datetime.datetime.now() - self.cached_time).days >= 20
    def updateTime(self):
        self.cached_time = django.utils.timezone.now()
    def get_short_name(self):
        return self.placeID

    def natural_key(self):
        return self.placeID
     
    def __str__(self):
        return self.placeID

    objects = Temp_Business_Manager()