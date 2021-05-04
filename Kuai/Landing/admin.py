from .models import *
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
admin.site.register(Subscriber)
admin.site.register(Queues)
#AUTH_USER_MODEL = 'models.CustomUser'
