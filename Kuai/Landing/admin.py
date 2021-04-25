from .models import User, Profile, waitData, waitTimes, capacityData, Capacity, Business, Temp_Business
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

class TempBizAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Temp_Business._meta.get_fields()]

# Register your models here.
admin.site.register(User)
admin.site.register(Profile)
admin.site.register(waitData)
admin.site.register(waitTimes)
admin.site.register(capacityData)
admin.site.register(Capacity)
admin.site.register(Business)
admin.site.register(Temp_Business, TempBizAdmin)
#AUTH_USER_MODEL = 'models.CustomUser'
