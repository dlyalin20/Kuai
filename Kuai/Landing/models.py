import re
from django.db import models
from django.db.models.deletion import CASCADE
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.core.exceptions import ValidationError
from django.contrib.postgres.fields import ArrayField
from django.core.validators import MaxValueValidator, MinValueValidator
from django.contrib.auth.models import User, PermissionsMixin, AbstractBaseUser, BaseUserManager

# validators
def validate_user(user):
    if len(user) <= 8 or len(user) > 20:
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
    business = models.CharField(max_length=40, default = None, null=True)
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

# Custom User Profile
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=CASCADE)
    latitude = models.IntegerField(null = True, validators= [
        MinValueValidator(-90),
        MaxValueValidator(90)
    ])
    longitude = models.IntegerField(null = True, validators = [
        MinValueValidator(-180),
        MaxValueValidator(180)
    ])
    birth_date = models.DateField(null = True, blank = True)
    favorite_businesses = ArrayField(models.CharField(max_length=40, blank=True))

    @receiver(post_save, sender=User)
    def create_user_profile(sender, instance, created, **kwargs):
        if created:
            Profile.objects.create(user = instance)
    
    @receiver(post_save, sender=User)
    def save_user_profile(sender, instance, **kwargs):
        instance.profile.save()


# Create your models here.
class waitData(models.Model):
    business = models.CharField(max_length = 40)
    wait_time = models.IntegerField(validators = [
        MinValueValidator(0),
        MaxValueValidator(180)
    ])
    author = models.CharField(max_length = 20)
    timestamp = models.DateTimeField(auto_now = True)

class capacityData(models.Model):
    business = models.CharField(max_length = 40)
    capacity = models.IntegerField(validators = [
        MinValueValidator(0),
        MaxValueValidator(100)
    ])
    author = models.CharField(max_length = 20)
    timestamp = models.DateTimeField(auto_now = True)

class waitTimes(models.Model):
    business = models.CharField(max_length = 40)
    numReviews = models.IntegerField(validators = [
        MinValueValidator(0)
    ], default = 0)
    average = models.IntegerField(validators = [
        MinValueValidator(0)
    ], default = 0)

class Capacity(models.Model):
    business = models.CharField(max_length = 40)
    numReviews = models.IntegerField(validators = [
        MinValueValidator(0)
    ], default = 0)
    average = models.IntegerField(validators = [
        MinValueValidator(0),
        MaxValueValidator(100)
    ], default = 0)

