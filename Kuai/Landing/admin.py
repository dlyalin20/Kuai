from .models import User, Profile
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

# Register your models here.
admin.site.register(User)
admin.site.register(Profile)

#AUTH_USER_MODEL = 'models.CustomUser'
