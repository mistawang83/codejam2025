from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import ChatMessage
from .serializers import ChatMessageSerializer

class ChatMessageViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all().order_by("created_at")
    serializer_class = ChatMessageSerializer

    def create(self, request, *args, **kwargs):
        # 1. Save user message
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # 2. Generate bot reply (simple example)
        user_text = serializer.validated_data["text"]
        output_text = user_text.capitalize()
        bot_text = f"{output_text}"  # Replace with AI or rules

        bot_message = ChatMessage.objects.create(text=bot_text, sender="bot")
        bot_serializer = self.get_serializer(bot_message)

        # 3. Return bot reply in response
        return Response(bot_serializer.data, status=status.HTTP_201_CREATED)