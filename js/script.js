let datos;
let chart;

fetch("./data/dataclean.json")
  .then(res => res.json())
  .then(json => {
    datos = json;
    calcular();
  });

document.querySelectorAll("input").forEach(el =>
  el.addEventListener("change", calcular)
);

function calcular() {

  const year = parseInt(document.getElementById("year").value);

  const currentYear = 2025;

  let factor = 1;

  if (year > currentYear) factor = 1 - ((year - currentYear) * 0.05);
  if (year < currentYear) factor = 1 + ((currentYear - year) * 0.05);
  if (factor < 0.5) factor = 0.5;

  let energiaBase = datos.energia_fotovoltaica.registros
    .reduce((a, d) => a + d.consumo, 0);

  let aguaBase = datos.indicadores_globales.consumo_total_agua_litros;

  let consumiblesBase = datos.facturas.material
    .reduce((a, f) => a + f.total, 0);

  let limpiezaBase = datos.facturas.limpieza
    .reduce((a, f) => a + f.total, 0);

  let energia = energiaBase * factor;
  let agua = aguaBase;
  let consumibles = consumiblesBase * factor;
  let limpieza = limpiezaBase * factor;

  if (document.getElementById("led").checked) energia *= 0.8;
  if (document.getElementById("standby").checked) energia *= 0.9;
  if (document.getElementById("agua-check").checked) agua *= 0.85;
  if (document.getElementById("papel").checked) consumibles *= 0.75;
  if (document.getElementById("limpieza-check").checked) limpieza *= 0.85;

  pintar("energia", energia, energiaBase * factor, "kWh");
  pintar("aguaResultado", agua, aguaBase, "L");
  pintar("consumibles", consumibles, consumiblesBase * factor, "€");
  pintar("limpiezaResultado", limpieza, limpiezaBase * factor, "€");

  crearGrafico();
}

function pintar(id, valor, base, unidad) {
  document.getElementById(id).innerHTML = valor.toFixed(2) + " " + unidad;

  let diff = base - valor;
  let diffId = id.replace("Resultado", "") + "Diff";

  document.getElementById(diffId).innerHTML =
    (diff > 0 ? "↓ -" : "") + diff.toFixed(2) + " ahorro";
}

function crearGrafico() {

const currentYear = parseInt(document.getElementById("year").value);

  // 👉 SIEMPRE los mismos años (FIJO)
  const years = [];
  for (let i = 0; i < 8; i++) {
    years.push(currentYear + i);
  }

  const baseEnergia = datos.energia_fotovoltaica.registros
    .reduce((a, d) => a + d.consumo, 0);

  const baseConsumibles = datos.facturas.material
    .reduce((a, f) => a + f.total, 0);

  const baseLimpieza = datos.facturas.limpieza
    .reduce((a, f) => a + f.total, 0);

  let energiaData = [];
  let consumiblesData = [];
  let limpiezaData = [];

  years.forEach(y => {

    let f = 1;

    if (y > currentYear) f = 1 - ((y - currentYear) * 0.05);
    if (f < 0.5) f = 0.5;

    // 👉 aplicar SOLO checkboxes (no input year)
    let energia = baseEnergia * f;
    let consumibles = baseConsumibles * f;
    let limpieza = baseLimpieza * f;

    if (document.getElementById("led").checked) energia *= 0.8;
    if (document.getElementById("standby").checked) energia *= 0.9;
    if (document.getElementById("papel").checked) consumibles *= 0.75;
    if (document.getElementById("limpieza-check").checked) limpieza *= 0.85;

    energiaData.push(energia);
    consumiblesData.push(consumibles);
    limpiezaData.push(limpieza);
  });

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("grafico1"), {
    type: "bar",
    data: {
      labels: years,
      datasets: [
        {
          label: "⚡ Energía",
          data: energiaData,
          backgroundColor: "#00ffae"
        },
        {
          label: "📦 Consumibles",
          data: consumiblesData,
          backgroundColor: "#c77dff"
        },
        {
          label: "🧹 Limpieza",
          data: limpiezaData,
          backgroundColor: "#ff9f1c"
        }
      ]
    },
    options: {
      plugins: {
        legend: { labels: { color: "white" } }
      },
      scales: {
        x: { ticks: { color: "white" } },
        y: { ticks: { color: "white" } }
      }
    }
  });
}