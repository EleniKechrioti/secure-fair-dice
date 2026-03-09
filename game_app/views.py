"""
Views for the Fair Digital Dice game application.
Includes the HTML rendering view and the DRF API endpoints for the commitment protocol.
"""

import random
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .crypto import generate_cryptographic_nonce, verify_commitment

# FRONTEND RENDERING VIEW

def game_board_view(request):
    """
    Renders the main game interface (Frontend).
    Serves the HTML template where the React/Vanilla JS application lives.
    """
    return render(request, 'index.html')

# CRYPTOGRAPHIC PROTOCOL API VIEWS

class GameInitializationView(APIView):
    """
    Step 1: Protocol Initialization.
    The client requests to start a round. The server generates its own secret roll ($V_B$)
    and a cryptographic nonce ($r_B$), saving them securely in the user's session.
    """
    # Requires the user to be logged in
    permission_classes = [] #permission_classes = [IsAuthenticated]

    def post(self, request):
        server_roll = random.randint(1, 6)
        server_nonce = generate_cryptographic_nonce()

        # Store critical data in the secure server-side session
        request.session['server_roll'] = server_roll
        request.session['server_nonce'] = server_nonce
        request.session['protocol_stage'] = 'initialized'

        return Response({
            "message": "Protocol initialized successfully.",
            "server_nonce": server_nonce
        }, status=status.HTTP_200_OK)


class GameCommitmentView(APIView):
    """
    Step 2: Commit Phase.
    The client submits their commitment hash ($h_{commit}$). 
    The server stores it and responds by revealing its own roll ($V_B$).
    """
    permission_classes = [] #permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.session.get('protocol_stage') != 'initialized':
            return Response({"error": "Protocol not initialized. Request r_B first."}, 
                            status=status.HTTP_400_BAD_REQUEST)

        client_hash = request.data.get('h_commit')
        if not client_hash:
            return Response({"error": "Missing commitment hash parameter."}, 
                            status=status.HTTP_400_BAD_REQUEST)

        # Store the client's commitment and update the state machine
        request.session['client_commitment_hash'] = client_hash
        request.session['protocol_stage'] = 'committed'

        return Response({
            "message": "Commitment accepted. Server reveals roll.",
            "server_roll": request.session.get('server_roll')
        }, status=status.HTTP_200_OK)


class GameRevealView(APIView):
    """
    Step 3: Open Phase & Verification.
    The client reveals their roll ($V_A$) and nonce ($r_A$). 
    The server verifies the hash, determines the winner, and clears the session.
    """
    permission_classes = [] #permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.session.get('protocol_stage') != 'committed':
            return Response({"error": "Protocol violation. Missing commitment phase."}, 
                            status=status.HTTP_400_BAD_REQUEST)

        client_roll = request.data.get('client_roll')
        client_nonce = request.data.get('client_nonce')

        if not client_roll or not client_nonce:
            return Response({"error": "Missing parameters for Open Phase."}, 
                            status=status.HTTP_400_BAD_REQUEST)

        # Retrieve session variables
        expected_hash = request.session.get('client_commitment_hash')
        server_nonce = request.session.get('server_nonce')
        server_roll = request.session.get('server_roll')

        # Cryptographic verification
        is_valid = verify_commitment(
            expected_hash=expected_hash,
            client_roll=int(client_roll),
            client_nonce=client_nonce,
            server_nonce=server_nonce
        )

        if not is_valid:
            request.session.flush()
            return Response({"error": "Cryptographic verification failed. Hash mismatch detected."}, 
                            status=status.HTTP_406_NOT_ACCEPTABLE)

        # Determine winner
        client_val = int(client_roll)
        if client_val > server_roll:
            outcome = "client_wins"
        elif client_val < server_roll:
            outcome = "server_wins"
        else:
            outcome = "draw"

        # Clean up the session state for the next round
        request.session.flush()

        return Response({
            "message": "Verification successful.",
            "outcome": outcome,
            "details": {
                "client_roll": client_val,
                "server_roll": server_roll
            }
        }, status=status.HTTP_200_OK)