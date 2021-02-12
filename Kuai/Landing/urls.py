from django.urls import path, include
from . import views
app_name = 'Landing'
urlpatterns = [
    path('', views.index, name='index'),
    path('login', views.login_view, name='login'),
    path('register', views.register_view, name='register'),
    # tentitive location may put in diffrent project
    path('search', views.search, name='search'),
    path('autocomplete', views.autocomplete_view, name="autocomplete"),
    path('<int:location_id>/go', views.go, name="go"),
    #     # new code
    # path('accounts/', include('allauth.urls')),

]