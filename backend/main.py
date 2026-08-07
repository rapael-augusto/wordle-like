from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo
import random
from psycopg.rows import dict_row
from database import conn # type: ignore
from schemas import SlugInput
import os

app = FastAPI()
origins = os.getenv("CORS_ORIGINS", "").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

characters = []

with conn.cursor(row_factory=dict_row) as cur:
    cur.execute("SELECT * FROM characters ORDER BY slug")
    characters = cur.fetchall()

rng = random.Random(37)
rng.shuffle(characters)

rng = random.SystemRandom()

def get_daily_char():
    today = datetime.now(ZoneInfo("America/Sao_Paulo")).date()
    return characters[today.toordinal() % len(characters)]

@app.get("/characters")
def get_all_characters():
    return [{
        "name": c["name"],
        "slug": c["slug"]
    } for c in characters ]

@app.get("/characters/random-id")
def get_random_char():
    return {
        "id": rng.choice(characters)["id"]
    }

@app.get("/characters/{slug}")
def get_specific_character(slug: str):
    specific_char = next((c for c in characters if c["slug"] == slug), None)

    if not specific_char: 
        return None
    
    return {
        "name": specific_char["name"],
        "rarity": specific_char["rarity"],
        "afflatus": specific_char["afflatus"],
        "dmg_type": specific_char["dmg_type"],
        "race": specific_char["race"],
        "version": specific_char["version"]
    }

@app.post("/guess")
def guess_attempt(input: SlugInput):
    guess_char = next((c for c in characters if c["slug"] == input.slug), None)
    daily_char = get_daily_char()

    if not guess_char:
        return None

    return {
        "name": {
            "value": guess_char["name"],
            "correct": guess_char["name"] == daily_char["name"],
        },
        "rarity": {
            "value": guess_char["rarity"],
            "comparison":
                "Higher" if guess_char["rarity"] < daily_char["rarity"]
                else "Lower" if guess_char["rarity"] > daily_char["rarity"]
                else True,
        },
        "afflatus": {
            "value": guess_char["afflatus"],
            "correct": guess_char["afflatus"] == daily_char["afflatus"],
        },
        "dmg_type": {
            "value": guess_char["dmg_type"],
            "correct": guess_char["dmg_type"] == daily_char["dmg_type"],
        },
        "race": {
            "value": guess_char["race"],
            "correct": guess_char["race"] == daily_char["race"],
        },
        "version": {
            "value": guess_char["version"],
            "comparison":
                "Higher" if guess_char["version"] < daily_char["version"]
                else "Lower" if guess_char["version"] > daily_char["version"]
                else True,
        },
    }

@app.post("/guess/{id}")
def guess_attempt_id(id: int, input: SlugInput):
    guess_char = next((c for c in characters if c["slug"] == input.slug), None)
    specific_char = next((c for c in characters if c["id"] == id), None)

    if not guess_char:
        return None
    
    if not specific_char:
        return None

    return {
        "name": {
            "value": guess_char["name"],
            "correct": guess_char["name"] == specific_char["name"],
        },
        "rarity": {
            "value": guess_char["rarity"],
            "comparison":
                "Higher" if guess_char["rarity"] < specific_char["rarity"]
                else "Lower" if guess_char["rarity"] > specific_char["rarity"]
                else True,
        },
        "afflatus": {
            "value": guess_char["afflatus"],
            "correct": guess_char["afflatus"] in (specific_char["afflatus"])
        },
        "dmg_type": {
            "value": guess_char["dmg_type"],
            "correct": guess_char["dmg_type"] == specific_char["dmg_type"],
        },
        "race": {
            "value": guess_char["race"],
            "correct": guess_char["race"] == specific_char["race"],
        },
        "version": {
            "value": guess_char["version"],
            "comparison":
                "Higher" if guess_char["version"] < specific_char["version"]
                else "Lower" if guess_char["version"] > specific_char["version"]
                else True,
        },
    }

@app.get("/guess/daily-result")
def get_daily_result():
    daily_char = get_daily_char()
    return {
        "name": daily_char["name"],
        "slug": daily_char["slug"]
    }

@app.get("/guess/yesterday-result")
def get_yesterday_result():
    yesterday = (datetime.now(ZoneInfo("America/Sao_Paulo")) - timedelta(days=1)).date()
    char = characters[yesterday.toordinal() % len(characters)]
    return {
        "name": char["name"],
        "slug": char["slug"]
    }