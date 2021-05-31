from .models import User, Profile, waitData, Business
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin


# Register your models here.
admin.site.register(User)
admin.site.register(Profile)
admin.site.register(waitData)
admin.site.register(Business)
#AUTH_USER_MODEL = 'models.CustomUser'
