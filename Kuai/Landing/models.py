from asyncio.tasks import wait
import re
import PIL
import pytz
import datetime
import collections
import django.utils
from typing import Iterable
from django.db import models
from jsonfield import JSONField
from django.contrib import admin
from django.dispatch import receiver
from django_mysql.models import ListTextField
from django.db.models.signals import post_save
from django.db.models.expressions import RawSQL
from django.core.exceptions import ValidationError
from django.db.models.deletion import CASCADE, SET_NULL
from django.core.validators import MaxValueValidator, MinValueValidator
from django.contrib.auth.models import User, PermissionsMixin, AbstractBaseUser, BaseUserManager
from django.db.models.functions import Now

# speed test the querying, add a second models file, add new businesses to popup

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

# Custom List Field Test
class ListField(models.TextField):
    """
    A custom Django field to represent lists as comma separated strings
    """

    def __init__(self, *args, **kwargs):
        self.token = kwargs.pop('token', ',')
        super().__init__(*args, **kwargs)

    def deconstruct(self):
        name, path, args, kwargs = super().deconstruct()
        kwargs['token'] = self.token
        return name, path, args, kwargs

    def to_python(self, value):

        class SubList(list):
            def __init__(self, token, *args):
                self.token = token
                super().__init__(*args)

            def __str__(self):
                return self.token.join(self)

        if isinstance(value, list):
            return value
        if value is None:
            return SubList(self.token)
        return SubList(self.token, value.split(self.token))

    def from_db_value(self, value, expression, connection):
        return self.to_python(value)

    def get_prep_value(self, value):
        if not value:
            return
        assert(isinstance(value, Iterable))
        return self.token.join(value)

    def value_to_string(self, obj):
        value = self.value_from_object(obj)
        return self.get_prep_value(value)



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

def getExperationTime():
    return django.utils.timezone.now() + django.utils.timezone.timedelta(minutes=5)

class waitData(models.Model):
    # business = models.CharField(max_length = 40, null = False, blank = False, unique = False)
    wait_time = models.FloatField(validators = [MinValueValidator(0)], null = False, blank = False)
   # # author = models.OneToOneField(User, max_length = 20, null = False, blank = False, on_delete=models.CASCADE)
    business = models.ForeignKey("Business", on_delete=models.CASCADE, related_name="review", null=True, blank=True)
    start_time = models.DateTimeField(default= django.utils.timezone.now, null= False, blank = False,)
    expiration_time = models.DateTimeField(default = getExperationTime, null = False, blank = False,)
    author = models.ForeignKey("Profile", related_name='all_time_updates', on_delete=CASCADE)

# 'business',
    REQUIRED_FIELDS = ['wait_time', 'author', 'business', 'expiration_time']

    def is_old(self):
        return (datetime.datetime.now() - self.timestamp).minutes + ((datetime.datetime.now() - self.timestamp).hours * 60) >= self.wait_time

    def get_short_name(self):
        return str(self.wait_time)

    def natural_key(self):
        return str(self.wait_time)

    def __str__(self):
        return str(self.wait_time)

class Subscriber(models.Model):
    account = models.ForeignKey('Profile', null = True, on_delete = CASCADE, )
    skips = models.IntegerField(default = 15, null = False, blank = False, validators = [
        MinValueValidator(0),
        MaxValueValidator(15)
    ])
    skip_history = ListField(null = True, blank = True)
    last_pay_date = models.DateField(null = False, blank = False)

# Custom User Profile
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=CASCADE, unique = True, related_name="profile")
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
    favorite_businesses = models.ManyToManyField('Business', blank = True)
    search_history = ListField(null = True, blank = True)
    last_time_update = models.OneToOneField(waitData, null = True, blank = True, on_delete = SET_NULL, related_name = 'lastime')

    is_subscribed = models.BooleanField(default = False)
    subscription = models.OneToOneField(Subscriber, on_delete = SET_NULL, null = True, blank = True)

    def create_subscriber(self):
        if self.is_subscribed:
            subscriber = Subscriber(last_pay_date = django.utils.timezone.utcnow())
            subscriber.save()
            subscription = subscriber
            self.save()
        else: print("Not a subscriber")

    def wait_too_soon(self, ID):
        try:
            if float((pytz.utc.localize(datetime.datetime.now()) - self.last_time_update.timestamp).total_seconds() / 60) < 15 and self.profile.last_time_update.business == ID:
                return True
            else: return False
        except AttributeError:
            return False

    def capacity_too_soon(self, ID):
        try:
            if float((pytz.utc.localize(datetime.datetime.now()) - self.last_capacity_update.timestamp).total_seconds() / 60) < 15 and self.profile.last_time_update.business == ID:
                return True
            else: return False
        except AttributeError:
            return False

    @receiver(post_save, sender=User)
    def create_user_profile(sender, instance, created, **kwargs):
        if created and not instance.is_business and not instance.is_staff:
            Profile.objects.create(user = instance)

    @receiver(post_save, sender=User)
    def save_user_profile(sender, instance, **kwargs):
        instance.profile.save()
        return str(instance.pk)


class Business_Manager(models.Manager):
    def isFloatNum(self, targetString):
        print(targetString)
        try :
            float(targetString)
            return(True)
        except :
            print("Not a float")
            return(False)
    # def getWaitTime(self, placeID):
    #     qs = self.get_queryset()
    #     qs = qs.filter(placeID = placeID)
    #     target = qs.get()
    #     return target.getAverage()

    def search(self, latitude, longitude, nelat, nelon, swlat, swlon, heat):
        x = self.isFloatNum(latitude) and self.isFloatNum(longitude)
        x = x and self.isFloatNum(nelat) and self.isFloatNum(nelon) and self.isFloatNum(swlat) and self.isFloatNum(swlon)
        if (x):
            # Great circle distance formula
            gcd_formula = "6371 * acos(min(max(\
            cos(radians(%s)) * cos(radians(lat)) \
            * cos(radians(lon) - radians(%s)) + \
            sin(radians(%s)) * sin(radians(lat)) \
            , -1), 1))"
            distance_raw_sql = RawSQL(
                gcd_formula,
                (latitude, longitude, latitude)
            )
            qs = self.get_queryset()
            #get biz in the viewable space
            qs = qs.filter(lat__lt = nelat, lat__gt = swlat, lon__lt = nelon, lon__gt = swlon)
            qs = qs.annotate(distance=distance_raw_sql)
            qs = qs.order_by('distance')
            # .values_list("placeID", flat=True)
            if (qs):
                listOfPlaceIDs = []
                if heat:
                    for place in qs:
                       average = place.getAverage();
                       if (average != "N/A"):
                          listOfPlaceIDs.append([[place.lat, place.lon], average])

                else:
                    qs = qs[:20] # take only the first 20
                    for place in qs:
                        # get wait time average
                        listOfPlaceIDs.append([place.placeID, place.getAverage()])
                    # data = serialize("json", [ qs, ])
                print('qs: ' + str(listOfPlaceIDs))
                if (len(listOfPlaceIDs) > 0):
                    return listOfPlaceIDs
            else:
                return "No Waittimes"
        return('bad inputs') #escape out

    def addWaitTime(self, waitTime, placeID, user):
        if (self.isFloatNum(waitTime)):
            # find the venue and add a review
            TarBiz = self.get(placeID=placeID)
            print(TarBiz)
            review = TarBiz.review.create(wait_time=waitTime, author=user.profile)
            review.save()
            return review
        else:
            return False
def get_biz_expiration():
    return django.utils.timezone.now() + django.utils.timezone.timedelta(days=20)
class Business(models.Model):
    lat = models.FloatField(blank = False, null = True)
    lon = models.FloatField(blank = False, null = True)
    verified = models.BooleanField(null = False, blank = False, default = False)
    expiration_time = models.DateTimeField(default=get_biz_expiration, null = False, blank = False)
    placeID = models.TextField(null = False, blank=False, unique = True, default = False)
    REQUIRED_FIELDS = ['lat', 'lon', 'verified', 'placeID', "expiration_time"]

    def updateTime(self):
        self.expiration_time = get_biz_expiration()

    def get_short_name(self):
        return self.placeID

    def natural_key(self):
        return self.placeID

    def __str__(self):
        return self.placeID

    def getAverage(self):
    # average accounting for other times
        # qs = self.review.filter(expiration_time__gt=Now()).values_list("wait_time", flat=True)
        qs = self.review.values_list("wait_time", flat=True)
        mySum = 0
        count = 0
        # print(qs.all())
        for waittime in qs.iterator():
            print("waittime: " + str(waittime))
            # print(waittime)
            mySum += waittime
            count += 1
        if mySum == 0:
            return "N/A"
        return (mySum / count)

    objects = Business_Manager()

class Staff_Profile(models.Model):
    user = models.OneToOneField(User, on_delete = CASCADE, unique = True)
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
