from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from ..models import  Category, Video, VideoCategory
from ..serializers import GetVideoWithCategoriesSerializer, CreateVideoSerializer, VideoSearchSerializer
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema


class GetVideos(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = VideoSearchSerializer
    
    @extend_schema(
        request=VideoSearchSerializer,
        responses={200: GetVideoWithCategoriesSerializer(many=True)},
        summary="Search videos",
        description="Search videos by title, duration, or category. At least one search parameter must be provided."
    )
    def post(self, request):
        # Validate the request data
        serializer = VideoSearchSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Get validated data
        title = serializer.validated_data.get('title', '').strip()
        duration = serializer.validated_data.get('duration', '').strip()
        category = serializer.validated_data.get('category', '').strip()
        
        # Build the query
        videos_query = Video.objects.all()
        
        # Apply category filter if provided
        if category:
            category_rows = Category.objects.filter(text__iregex=fr".*{category}.*")
            video_ids = VideoCategory.objects.filter(category__in=category_rows).values_list("video_id", flat=True).distinct()
            videos_query = videos_query.filter(id__in=video_ids)
        
        # Apply title filter if provided
        if title:
            videos_query = videos_query.filter(title__iregex=fr".*{title}.*")
        
        # Apply duration filter if provided
        if duration:
            videos_query = videos_query.filter(duration__iregex=fr".*{duration}.*")

        response_data = GetVideoWithCategoriesSerializer(videos_query, many=True).data
        return Response(response_data, status=status.HTTP_200_OK)
    

class DeleteVideo(APIView):
    permission_classes = [IsAuthenticated]
    def delete(self, request, id):
        try:
            video = Video.objects.get(id=id)
            video.delete()
            return Response({"message": "Successfully Deleted Video"}, status=status.HTTP_204_NO_CONTENT)
        except Video.DoesNotExist:
            return Response({"message": "Video not found"}, status=status.HTTP_404_NOT_FOUND)
    

class CreateVideo(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CreateVideoSerializer
    
    @extend_schema(
        request=CreateVideoSerializer,
        responses={201: {"type": "object", "properties": {"id": {"type": "integer"}}}},
        summary="Create or update video",
        description="Creates a new video or updates an existing one with categories"
    )
    def post(self, request):
        serializedData = CreateVideoSerializer(data=request.data)
        if serializedData.is_valid():
            videoData = serializedData.validated_data
            if videoData["id"] != 0:
                videoID = self.modifyVideo(videoData)
                return Response({"id": videoID}, status=status.HTTP_201_CREATED)
            else:
                videoID = self.createVideo(videoData)
                return Response({"id": videoID}, status=status.HTTP_201_CREATED)
        return Response({ 
            "detail": "Failed to Create Video", 
            "errors": serializedData.errors 
        }, status=status.HTTP_400_BAD_REQUEST)

    def createVideo(self, videoData):
        video = Video.objects.create(
            title = videoData["title"],
            duration = videoData["duration"],
            description = videoData["description"],
            url = videoData.get("url", "")
        )


        for categoryData in videoData["categories"]:
            try:
                categoryRow = Category.objects.get(text = categoryData["text"])
            except:
                categoryRow = Category.objects.create(text = categoryData["text"])

            VideoCategory.objects.create(
                video = video,
                category = categoryRow
            )

        return video.id
    
    def modifyVideo(self, videoData):
        Video.objects.filter(id = videoData["id"]).update(
            title = videoData["title"],
            duration = videoData["duration"],
            description = videoData["description"],
            url = videoData.get("url", "")
        )
        originalVideo = Video.objects.get(id = videoData["id"])
        originalVideo.videocategory_set.all().delete()

        for categoryData in videoData["categories"]:
            try:
                categoryRow = Category.objects.get(text = categoryData["text"])
            except:
                categoryRow = Category.objects.create(text = categoryData["text"])

            VideoCategory.objects.create(
                video = originalVideo,
                category = categoryRow
            )

        return originalVideo.id