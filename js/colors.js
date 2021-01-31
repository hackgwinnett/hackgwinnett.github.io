var R = 255;
var G = 255;
var B = 255;

var colorUpdate = window.setInterval(updateColor, 15);

function updateColor() {
    
    R--;
    G--;
    B--;

    changeForeColor("homeTitle", R, G, B)

    if (R == 45 && G == 45 && B == 45) {
        window.clearInterval(colorUpdate);
    }
}

function changeForeColor(element, R, G, B) {
    document.getElementById(element).style.color = "rgb(" + R + ", " + G + ", " + B + ")";
}