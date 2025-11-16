from django.shortcuts import render
from rest_framework import viewsets
from .models import ChatMessage
from .serializers import ChatMessageSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view, parser_classes
from .services.repair_analyzer import analyzer, humanize_analysis
import base64
from openai import OpenAI

class ChatMessageViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all().order_by("created_at")
    serializer_class = ChatMessageSerializer

@api_view(["POST"])
def analyze_image_view(request):
    """
    Endpoint that accepts an image + description and returns JSON.

    Expected JSON body:
    {
      "image": "data:image/jpeg;base64,...",
      "description": "User's description of the problem"
    }
    """
    image = request.data.get("image")
    description = request.data.get("description")

    if not image or not description:
        return Response(
            {"error": "Both 'image' and 'description' are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # If image is a full data URL, strip the prefix so you have the raw base64
    if isinstance(image, str) and image.startswith("data:"):
        try:
            header, base64_data = image.split(",", 1)
        except ValueError:
            return Response(
                {"error": "Invalid data URL format for 'image'."},
                status=status.HTTP_400_BAD_REQUEST,
            )
    else:
        base64_data = image  # assume it's already raw base64

    return Response(
        {
            "success": True,
            "message": "Image and description received.",
            "description": description,
            "image_base64_length": len(base64_data),
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def analyze_image_upload_view(request):
    """
    Accepts an uploaded image file + description (multipart/form-data),
    sends it to the AI model, and returns JSON analysis + human text.
    """
    image_file = request.FILES.get("image")
    description = request.data.get("description")

    if not image_file or not description:
        return Response(
            {"error": "Both 'image' (file) and 'description' are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Read file and convert to base64
    image_bytes = image_file.read()
    image_base64 = base64.b64encode(image_bytes).decode("utf-8")
    media_type = image_file.content_type or "image/jpeg"

    ai_result = analyzer.analyze_repair(
        image_base64=image_base64,
        description=description,
        skill_level="beginner",        
        budget="moderate",
        location="United States",
        media_type=media_type,
    )

    if not ai_result.get("success"):
        # If model call failed, return the error payload
        return Response(ai_result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    analysis = ai_result["data"]

    # get a human-style explanation
    human_text = humanize_analysis(analysis, description)

    return Response(
        {
            "success": True,
            "analysis": analysis,        # structured JSON from the model
            "human_text": human_text,    # conversational explanation
            "filename": image_file.name,
            "size_bytes": image_file.size,
        },
        status=status.HTTP_200_OK,
    )

messages_store = []

@api_view(['GET', 'POST'])
def messages_view(request):
    if request.method == 'GET':
        return Response(messages_store)
    
    elif request.method == 'POST':
        message = request.data
        messages_store.append(message)
        return Response(message, status=201)