from .models import User, Profile, waitData, waitTimes, capacityData, Capacity
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

# Register your models here.
admin.site.register(User)
admin.site.register(Profile)
admin.site.register(waitData)
admin.site.register(waitTimes)
admin.site.register(capacityData)
admin.site.register(Capacity)

#AUTH_USER_MODEL = 'models.CustomUser'
