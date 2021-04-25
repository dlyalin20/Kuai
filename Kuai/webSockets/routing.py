# chat/routing.py
from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path('ws/go/SearchNearby', consumers.ChatConsumer.as_asgi()),
]