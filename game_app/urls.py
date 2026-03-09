"""
URL Routing configuration for the game_app.
Maps the API endpoints to their respective DRF Views.
"""

from django.urls import path
from .views import (
    game_board_view, 
    GameInitializationView, 
    GameCommitmentView, 
    GameRevealView
)

urlpatterns = [
    # Frontend route
    path('', game_board_view, name='game-home'),
    
    # API routes for the cryptographic protocol
    path('api/game/init/', GameInitializationView.as_view(), name='game-init'),
    path('api/game/commit/', GameCommitmentView.as_view(), name='game-commit'),
    path('api/game/reveal/', GameRevealView.as_view(), name='game-reveal'),
]