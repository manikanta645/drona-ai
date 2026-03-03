#!/usr/bin/env python3
import requests
import json
import time

# Wait for services to start
time.sleep(3)

print("=" * 60)
print("TESTING DRONA BACKEND")
print("=" * 60)

# Test 1: Health check
print("\nTest 1: Health Check")
print("-" * 40)
try:
    resp = requests.get("http://localhost:8000/health", timeout=5)
    print(f"Status: {resp.status_code}")
    print(f"Response: {json.dumps(resp.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")

# Test 2: Simple question
print("\nTest 2: Simple Question in Chat Mode")
print("-" * 40)
try:
    payload = {
        "question": "Hello Guru",
        "lang": "en",
        "mode": "chat",
        "student_name": "TestStudent"
    }
    resp = requests.post("http://localhost:8000/ask", json=payload, timeout=30)
    print(f"Status: {resp.status_code}")
    data = resp.json()
    print(f"Mode: {data.get('mode')}")
    print(f"Response: {data.get('answer', 'No answer')[:100]}...")
    print(f"AI Used: {data.get('ai_used')}")
except Exception as e:
    print(f"Error: {e}")

# Test 3: Question in specific mode
print("\nTest 3: Question in Dhanur Mode")
print("-" * 40)
try:
    payload = {
        "question": "How do I improve my precision in archery?",
        "lang": "en",
        "mode": "dhanur",
        "student_name": "TestStudent",
        "vidya": "dhanur"
    }
    resp = requests.post("http://localhost:8000/ask", json=payload, timeout=30)
    print(f"Status: {resp.status_code}")
    data = resp.json()
    print(f"Mode: {data.get('mode')}")
    print(f"Response: {data.get('answer', 'No answer')[:100]}...")
    print(f"AI Used: {data.get('ai_used')}")
except Exception as e:
    print(f"Error: {e}")

print("\n" + "=" * 60)
print("TESTS COMPLETE")
print("=" * 60)
