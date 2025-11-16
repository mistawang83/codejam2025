# from rest_framework.routers import DefaultRouter
# from .views import ItemViewSet

# router = DefaultRouter()
# router.register(r'items', ItemViewSet)

# urlpatterns = router.urls

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatMessageViewSet, analyze_image_view, analyze_image_upload_view


router = DefaultRouter()
router.register(r"messages", ChatMessageViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("analyze-image/", analyze_image_view, name="analyze-image"),
    path("analyze-image-upload/", analyze_image_upload_view, name="analyze-image-upload"),
]


