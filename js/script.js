let datos;
let chart;

fetch("./data/dataclean.json")
  .then(res => res.json())
  .then(json => {
    datos = json;
    actualizarTodo();
  });

document.querySelectorAll("input").forEach(el => {
  el.addEventListener("change", actualizarTodo);
});

// ========================
function actualizarTodo() {
  calcular();
  crearGrafico();
}

// ========================
function calcular() {

  let year = parseInt(document.getElementById("year").value);

  let energiaBase = datos.energia_fotovoltaica.registros
    .reduce((a,d)=>a+d.consumo,0);

  let aguaBase = datos.indicadores_globales.consumo_total_agua_litros;
  let consumiblesBase = datos.facturas.material.reduce((a,f)=>a+f.total,0);
  let limpiezaBase = datos.facturas.limpieza.reduce((a,f)=>a+f.total,0);

  let factor = 1 - (year - 2025) * 0.05;

  let energia = energiaBase * factor;
  let agua = aguaBase * factor;
  let consumibles = consumiblesBase * factor;
  let limpieza = limpiezaBase * factor;

  if (led.checked) energia *= 0.8;
  if (standby.checked) energia *= 0.9;
  if (document.getElementById("agua-check").checked) agua *= 0.85;
  if (papel.checked) consumibles *= 0.75;
  if (document.getElementById("limpieza-check").checked) limpieza *= 0.85;

  document.getElementById("energia").innerHTML = energia.toFixed(2)+" kWh";
  document.getElementById("aguaResultado").innerHTML = Math.round(agua)+" L";
  document.getElementById("consumibles").innerHTML = consumibles.toFixed(2)+" €";
  document.getElementById("limpiezaResultado").innerHTML = limpieza.toFixed(2)+" €";

  document.getElementById("energiaDiff").innerHTML = (energia-energiaBase).toFixed(2);
  document.getElementById("aguaDiff").innerHTML = (agua-aguaBase).toFixed(0);
  document.getElementById("consumiblesDiff").innerHTML = (consumibles-consumiblesBase).toFixed(2);
  document.getElementById("limpiezaDiff").innerHTML = (limpieza-limpiezaBase).toFixed(2);
}

// ========================
function crearGrafico() {

  let year = parseInt(document.getElementById("year").value);

  let baseEnergia = datos.energia_fotovoltaica.registros
    .reduce((a,d)=>a+d.consumo,0);

  let baseConsumibles = datos.facturas.material.reduce((a,f)=>a+f.total,0);
  let baseLimpieza = datos.facturas.limpieza.reduce((a,f)=>a+f.total,0);

  let labels = [];
  let energiaData = [];
  let consumiblesData = [];
  let limpiezaData = [];

  for (let i = 0; i < 8; i++) {

    let y = year + i;
    let factor = 1 - (y - 2025) * 0.05;

    let energia = baseEnergia * factor;
    let consumibles = baseConsumibles * factor;
    let limpieza = baseLimpieza * factor;

    // 🔥 IMPORTANTE: aplicar ahorro también al gráfico
    if (led.checked) energia *= 0.8;
    if (standby.checked) energia *= 0.9;
    if (papel.checked) consumibles *= 0.75;
    if (document.getElementById("limpieza-check").checked) limpieza *= 0.85;

    labels.push(y);
    energiaData.push(energia);
    consumiblesData.push(consumibles);
    limpiezaData.push(limpieza);
  }

  if (chart) chart.destroy();

  const ctx = document.getElementById("grafico1");

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        { label: "Energía", data: energiaData },
        { label: "Consumibles", data: consumiblesData },
        { label: "Limpieza", data: limpiezaData }
      ]
    },
    options: {
      animation: {
        duration: 800
      }
    }
  });
}