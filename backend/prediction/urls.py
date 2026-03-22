from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from . import views

urlpatterns = [
    path("predict/", csrf_exempt(views.predict_house_price)),
    path("options/", views.get_options),
    path("contact_agent/", csrf_exempt(views.contact_agent)),
    path("save_prediction/", csrf_exempt(views.save_prediction)), # ⭐ NEW: "Save" Action
    path("saved_predictions/", views.saved_predictions), # GET List
    path("recommendations/", views.get_recommendations),
    path("analytics/features/", views.get_analytics_features),
    path("analytics/market_status/", views.get_market_status),
]
