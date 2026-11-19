const nexusConfig = {
    clockRefreshRate: 1000,
    threatRefreshRate: 4000,
    networkRefreshRate: 2000,
    mapRefreshRate: 5000,
    historyLength: 30,
};

document.addEventListener("DOMContentLoaded", function () {
    initializeClock();
    initializeThreatChart();
    initializeNetworkChart();
    initializeWorldMap();
});

function initializeClock() {
    const dateElement = document.getElementById("current-date");
    if (!dateElement) {
        console.warn("nexus: clock element not found.");
        return;
    }

    function updateClock() {
        dateElement.textContent = new Date().toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    }

    updateClock();
    setInterval(updateClock, nexusConfig.clockRefreshRate);
}

function createChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 350,
        },
        interaction: {
            intersect: false,
            mode: "index",
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: "#151828",
                titleColor: "#e8ebf8",
                bodyColor: "#aab2cb",
                borderColor: "rgba(157, 170, 212, 0.18)",
                borderWidth: 1,
            },
        },
        scales: {
            x: {
                grid: {
                    color: "rgba(157, 170, 212, 0.07)",
                },
                ticks: {
                    color: "#78819d",
                    maxTicksLimit: 7,
                    maxRotation: 0,
                    font: { size: 8 },
                },
                border: { display: false },
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: "rgba(157, 170, 212, 0.07)",
                },
                ticks: {
                    color: "#78819d",
                    maxTicksLimit: 5,
                    font: { size: 8 },
                },
                border: { display: false },
            },
        },
    };
}

function createHistoryLabels(step, unit) {
    return Array.from({ length: nexusConfig.historyLength }, function (_, index) {
        const offset = (nexusConfig.historyLength - index - 1) * step;
        return offset === 0 ? "now" : `-${offset}${unit}`;
    });
}

function initializeThreatChart() {
    const canvas = document.getElementById("threat-chart");
    if (!canvas) {
        console.warn("nexus: threat chart canvas not found.");
        return;
    }
    if (typeof Chart === "undefined") {
        console.error("nexus: Chart.js is not loaded.");
        return;
    }

    const chart = new Chart(canvas, {
        type: "line",
        data: {
            labels: createHistoryLabels(2, "m"),
            datasets: [
                {
                    label: "Blocked attempts",
                    data: Array.from({ length: nexusConfig.historyLength }, () => generateValue(10, 85)),
                    borderColor: "#22d3dc",
                    backgroundColor: "rgba(34, 211, 220, 0.08)",
                    borderWidth: 1.5,
                    pointRadius: 0,
                    pointHoverRadius: 3,
                    fill: true,
                    tension: 0.35,
                },
                {
                    label: "Monitored events",
                    data: Array.from({ length: nexusConfig.historyLength }, () => generateValue(8, 65)),
                    borderColor: "#9474ff",
                    backgroundColor: "rgba(148, 116, 255, 0.04)",
                    borderWidth: 1.3,
                    pointRadius: 0,
                    pointHoverRadius: 3,
                    fill: true,
                    tension: 0.35,
                },
            ],
        },
        options: createChartOptions(),
    });

    setInterval(function () {
        chart.data.labels.shift();
        chart.data.labels.push("now");
        chart.data.datasets[0].data.shift();
        chart.data.datasets[0].data.push(generateValue(10, 85));
        chart.data.datasets[1].data.shift();
        chart.data.datasets[1].data.push(generateValue(8, 65));
        chart.update("none");
    }, nexusConfig.threatRefreshRate);
}

function initializeNetworkChart() {
    const canvas = document.getElementById("network-chart");
    if (!canvas) {
        console.warn("nexus: network chart canvas not found.");
        return;
    }
    if (typeof Chart === "undefined") {
        console.error("nexus: Chart.js is not loaded.");
        return;
    }

    const chart = new Chart(canvas, {
        type: "line",
        data: {
            labels: createHistoryLabels(2, "s"),
            datasets: [
                {
                    label: "Inbound traffic",
                    data: Array.from({ length: nexusConfig.historyLength }, () => generateValue(35, 85)),
                    borderColor: "#22d3dc",
                    backgroundColor: createGradient(canvas, "#22d3dc"),
                    borderWidth: 1.5,
                    pointRadius: 0,
                    fill: true,
                    tension: 0.3,
                },
            ],
        },
        options: createChartOptions(),
    });

    setInterval(function () {
        chart.data.labels.shift();
        chart.data.labels.push("now");
        chart.data.datasets[0].data.shift();
        chart.data.datasets[0].data.push(generateValue(35, 85));
        chart.update("none");
    }, nexusConfig.networkRefreshRate);
}

function createGradient(canvas, color) {
    const context = canvas.getContext("2d");
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, `${color}55`);
    gradient.addColorStop(1, `${color}00`);
    return gradient;
}

function generateValue(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const demoMapLocations = [
    { city: "New York, USA", coordinates: [40.7128, -74.006] },
    { city: "London, UK", coordinates: [51.5072, -0.1276] },
    { city: "Tokyo, Japan", coordinates: [35.6762, 139.6503] },
    { city: "Singapore", coordinates: [1.3521, 103.8198] },
    { city: "São Paulo, Brazil", coordinates: [-23.5505, -46.6333] },
    { city: "Sydney, Australia", coordinates: [-33.8688, 151.2093] },
    { city: "Frankfurt, Germany", coordinates: [50.1109, 8.6821] },
    { city: "Cape Town, South Africa", coordinates: [-33.9249, 18.4241] },
    { city: "Toronto, Canada", coordinates: [43.6532, -79.3832] },
    { city: "Seoul, South Korea", coordinates: [37.5665, 126.978] },
];

const demoEventTypes = [
    { label: "Suspicious login blocked", category: "blocked", color: "#fb5c79" },
    { label: "Unusual traffic monitored", category: "monitored", color: "#22d3dc" },
    { label: "Access attempt blocked", category: "blocked", color: "#fb5c79" },
    { label: "Port scan detected", category: "monitored", color: "#9474ff" },
];

function initializeWorldMap() {
    const mapElement = document.getElementById("world-map");
    const feedElement = document.getElementById("map-event-feed");
    const countElement = document.getElementById("map-event-count");
    const blockedCountElement = document.getElementById("blocked-count");

    if (!mapElement || !feedElement || !countElement) {
        console.warn("nexus: world map elements not found.");
        return;
    }
    if (typeof L === "undefined") {
        console.error("nexus: Leaflet is not loaded.");
        mapElement.textContent = "Map library unavailable. Check your connection and reload.";
        return;
    }

    const map = L.map(mapElement, {
        worldCopyJump: true,
        minZoom: 0,
        zoomSnap: 0.25,
        zoomControl: true,
    }).setView([20, 0], 1);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
    }).addTo(map);
    map.fitWorld({ padding: [8, 8] });

    const hubs = [
        [40.7128, -74.006],
        [51.5072, -0.1276],
        [1.3521, 103.8198],
    ];
    const eventLayers = [];
    let eventCount = 0;
    let blockedCount = Number(blockedCountElement ? blockedCountElement.textContent : 986);

    function addDemoEvent() {
        const location = demoMapLocations[generateValue(0, demoMapLocations.length - 1)];
        const eventType = demoEventTypes[generateValue(0, demoEventTypes.length - 1)];
        const destination = hubs[generateValue(0, hubs.length - 1)];
        const time = new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
        const isMonitored = eventType.category === "monitored";

        const marker = L.circleMarker(location.coordinates, {
            radius: isMonitored ? 5 : 6,
            color: eventType.color,
            fillColor: eventType.color,
            fillOpacity: 0.9,
            weight: 1.5,
            className: `activity-marker ${isMonitored ? "monitored-marker" : "blocked-marker"}`,
        }).addTo(map);
        marker.bindPopup(
            `<strong>${eventType.label}</strong><br>${location.city}<br>${time}<br><small>SIMULATED EVENT</small>`
        );

        const route = L.polyline([location.coordinates, destination], {
            color: eventType.color,
            weight: 1,
            opacity: 0.56,
            dashArray: "3 6",
        }).addTo(map);

        eventLayers.push({ marker, route });
        if (eventLayers.length > 32) {
            const oldest = eventLayers.shift();
            map.removeLayer(oldest.marker);
            map.removeLayer(oldest.route);
        }

        const item = document.createElement("li");
        if (isMonitored) {
            item.classList.add("monitored");
        }
        const title = document.createElement("strong");
        title.textContent = eventType.label;
        const detail = document.createElement("span");
        detail.textContent = `${location.city} · ${time} · simulated`;
        item.append(title, detail);
        feedElement.prepend(item);
        while (feedElement.children.length > 4) {
            feedElement.lastElementChild.remove();
        }

        eventCount += 1;
        countElement.textContent = `${eventCount} events`;
        if (!isMonitored && blockedCountElement) {
            blockedCount += 1;
            blockedCountElement.textContent = blockedCount.toLocaleString("en-US");
        }
    }

    for (let index = 0; index < 6; index++) {
        addDemoEvent();
    }
    setInterval(addDemoEvent, nexusConfig.mapRefreshRate);
}
