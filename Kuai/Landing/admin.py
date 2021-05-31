from .models import User, Profile, waitData, Business
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

class BusinessBizAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Business._meta.get_fields()]

# Register your models here.
admin.site.register(User)
admin.site.register(Profile)
admin.site.register(waitData)
admin.site.register(Business, BusinessBizAdmin)
#AUTH_USER_MODEL = 'models.CustomUser'
