from .models import User, Profile, waitData, waitTimes, capacityData, Capacity, Business, Temp_Business
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

# Register your models here.
admin.site.register(User)
admin.site.register(Profile)
admin.site.register(waitData)
admin.site.register(waitTimes)
admin.site.register(capacityData)
admin.site.register(Capacity)
admin.site.register(Business)
admin.site.register(Temp_Business)
#AUTH_USER_MODEL = 'models.CustomUser'
