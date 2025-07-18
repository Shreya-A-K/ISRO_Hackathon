from flask import Flask, render_template, request
import requests

app = Flask(__name__)

def get_coordinates(query):
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        'q': query,
        'format': 'json'
    }
    response = requests.get(url, params=params, headers={"User-Agent": "AtmosSense-App"})
    data = response.json()
    if data:
        lat = float(data[0]['lat'])
        lon = float(data[0]['lon'])
        return lat, lon
    else:
        return None, None
    
@app.route("/", methods=["GET", "POST"])
def start():
    if request.method == "GET":
        return render_template("index.html", default_pin="", default_location="")
    elif request.method == "POST":
        pin = request.form["pin"]
        location = request.form["location"]

        query = location if location.strip() else pin
        lat, lon = get_coordinates(query)

        return render_template(
            "second.html",
            pin=pin,
            location=location,
            lat=lat,
            lon=lon
        )

if __name__ == "__main__":
    app.debug = True
    app.run()
