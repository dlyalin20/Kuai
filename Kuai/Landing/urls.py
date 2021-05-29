from . import views
from django.urls import path, include
from django.views.generic.base import RedirectView

app_name = 'Landing'
urlpatterns = [
    path('', views.index, name='index'),
    # path('login', views.login_view, name='login'),
    # path('logout', views.logout_view, name='login'),
    # path('register', views.register_view, name='register'),
    # tentative location may put in different project
    # path('search', views.search, name='search'),
    path('go', views.go, name="go"),
    path("profile", views.profile, name="profile"),
    #     # new code
    # path('accounts/', include('allauth.urls')),
    path('popup/<str:placeID>', views.popup, name="test"),
    path('business_view/<str:placeID>', views.test, name="business_view"),
    path('quickWaitTime', views.quickWaitTime, name="quickWaitTime"),
    path('longWaitTime', views.longWaitTime, name="longWaitTime"),
    path('longCapacity', views.longCapacity, name="longCapacity"),
    path('testPopup', views.testing, name="testpopup")
    # archive
    # path('autocomplete', views.autocomplete_view, name="autocomplete"),
]
