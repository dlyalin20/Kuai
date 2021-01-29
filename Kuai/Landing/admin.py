from .models import User
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

# Register your models here.
admin.site.register(User)
#AUTH_USER_MODEL = 'models.CustomUser'
