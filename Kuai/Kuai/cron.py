from django.apps import apps
from django.db.models.functions import Now
def delete_cached_businesses():
    Business = apps.get_model('Landing', 'Business')
    x = Business.objects.filter(verified=False, expiration_time__lt=Now()).delete()
    print("info on deleting temp businesses,  at servertime " + Now()+" : " + x)
