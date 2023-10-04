import { startWidgets } from "./components/widgets.js"
try {
    startWidgets()
}
catch (error) {
    console.log("could not start widgets")
}
window.onload = () => {
    startWidgets()
}