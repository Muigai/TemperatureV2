import { publish, subscribe, TextBox } from "rahisi";
import { React } from "rahisi";

class TemperatureChanged {

    public static readonly eventName = "temperaturechanged";

    constructor(public readonly celsius: number,
                public readonly fahrenheit: number,
                public readonly sourceScale: "c" | "f") { }
}

const scaleNames = {
    c: "Celsius",
    f: "Fahrenheit",
};

const temperatureInput = (scale: "c" | "f") => {

    const toCelsius = (fahrenheit: number) => (fahrenheit - 32) * 5 / 9;

    const toFahrenheit = (celsius: number) => (celsius * 9 / 5) + 32;

    let temperature = Number.NaN;

    const getTemperature = () => isNaN(temperature) ? "" : temperature.toString();

    const publishTemperatureChanged =
        (s: string) => {

            const temp = parseFloat(s);

            const data: TemperatureChanged = {
                celsius: scale === "c" ? temp : toCelsius(temp),
                fahrenheit: scale === "f" ? temp : toFahrenheit(temp),
                sourceScale: scale,
            };

            publish(TemperatureChanged.eventName, data);
        };

    const onTemperatureChanged = (e: TemperatureChanged) => {
        if (scale !== e.sourceScale) {
            temperature = (scale === "c" ? e.celsius : e.fahrenheit);
        }
    };

    subscribe(TemperatureChanged.eventName, onTemperatureChanged);

    return (
        <fieldset>
            <legend>Enter temperature in {scaleNames[scale]}:</legend>
            <TextBox value={getTemperature} onTextChanged={publishTemperatureChanged} />
        </fieldset>
    );

};

const boilingVerdict = () => {

    let verdict = "";

    const onTemperatureChanged = (e: TemperatureChanged) => {

        if (isNaN(e.celsius)) {
            verdict = "";
            return;
        }

        const notOrEmptyString = e.celsius < 100 ? "not" : "";

        verdict = `The water would ${notOrEmptyString} boil`;
    };

    subscribe(TemperatureChanged.eventName, onTemperatureChanged);

    return () => verdict;
};

function main() {

    const calculator = () => (
        <div>
            {temperatureInput("c")}
            {temperatureInput("f")}
            {boilingVerdict()}
        </div>
    ).mount(document.body);

    calculator();
}

document.addEventListener("DOMContentLoaded", main, false);
