from flask import Flask, render_template, request

app=Flask(__name__)

@app.route("/", methods=["GET","POST"])
def start():
    if request.method=="GET":
        return render_template("index.html")
    elif request.method=="POST":
        pin=request.form["pin"]
        location=request.form["location"]
        return render_template("second.html",pin=pin,location=location)

if __name__=="__main__":
    app.debug=True
    app.run()