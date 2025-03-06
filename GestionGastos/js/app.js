document.addEventListener("DOMContentLoaded", () => {
    cargarTransacciones();
    if (localStorage.getItem("modoOscuro") === "true") {
        document.body.classList.add("dark-mode");
    }
    actualizarGraficos();
});

document.getElementById("agregar").addEventListener("click", agregarTransaccion);
document.getElementById("descargarCSV").addEventListener("click", descargarCSV);
document.getElementById("descargarPDF").addEventListener("click", descargarPDF);
document.getElementById("modoOscuro").addEventListener("click", toggleModoOscuro);

let graficoBarras, graficoLineas;

function obtenerTransacciones() {
    return JSON.parse(localStorage.getItem("transacciones")) || [];
}

function guardarTransacciones(transacciones) {
    localStorage.setItem("transacciones", JSON.stringify(transacciones));
}

function agregarTransaccion() {
    let fecha = document.getElementById("fecha").value;
    let descripcion = document.getElementById("descripcion").value;
    let monto = parseFloat(document.getElementById("monto").value);
    let categoria = document.getElementById("categoria").value;

    if (!fecha || !descripcion || isNaN(monto)) return alert("Todos los campos son obligatorios");

    let transacciones = obtenerTransacciones();
    transacciones.push({ fecha, descripcion, monto, categoria });

    guardarTransacciones(transacciones);
    mostrarTransacciones();
    actualizarGraficos();
}

function mostrarTransacciones() {
    let lista = document.getElementById("lista-transacciones");
    lista.innerHTML = "";
    let balance = 0;

    obtenerTransacciones().forEach((t, index) => {
        let li = document.createElement("li");
        li.innerHTML = `${t.fecha} - ${t.descripcion} - ${t.monto.toFixed(2)} (${t.categoria}) 
                        <button onclick="eliminarTransaccion(${index})">❌</button>`;
        lista.appendChild(li);
        balance += t.monto;
    });

    document.getElementById("balance").innerText = `$${balance.toFixed(2)}`;
}

function eliminarTransaccion(index) {
    let transacciones = obtenerTransacciones();
    transacciones.splice(index, 1);
    guardarTransacciones(transacciones);
    mostrarTransacciones();
    actualizarGraficos();
}

function actualizarGraficos() {
    let transacciones = obtenerTransacciones();
    let categorias = ["Alimentación", "Transporte", "Entretenimiento", "Otros"];
    let valores = categorias.map(c => transacciones.filter(t => t.categoria === c).reduce((sum, t) => sum + t.monto, 0));

    let fechas = [...new Set(transacciones.map(t => t.fecha))].sort();
    let valoresPorFecha = fechas.map(f => transacciones.filter(t => t.fecha === f).reduce((sum, t) => sum + t.monto, 0));

    if (graficoBarras) graficoBarras.destroy();
    if (graficoLineas) graficoLineas.destroy();

    let ctxBarras = document.getElementById("graficoBarras").getContext("2d");
    graficoBarras = new Chart(ctxBarras, {
        type: "bar",
        data: {
            labels: categorias,
            datasets: [{
                label: "Gastos por Categoría",
                data: valores,
                backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0"]
            }]
        }
    });

    let ctxLineas = document.getElementById("graficoLineas").getContext("2d");
    graficoLineas = new Chart(ctxLineas, {
        type: "line",
        data: {
            labels: fechas,
            datasets: [{
                label: "Evolución de Gastos",
                data: valoresPorFecha,
                borderColor: "#4CAF50",
                fill: false
            }]
        }
    });
}

function descargarCSV() {
    let transacciones = obtenerTransacciones();
    let balance = transacciones.reduce((sum, t) => sum + t.monto, 0);

    let csvContent = "data:text/csv;charset=utf-8,Fecha,Descripción,Monto,Categoría\n";
    
    transacciones.forEach(t => {
        csvContent += `${t.fecha},${t.descripcion},${t.monto},${t.categoria}\n`;
    });

    
    csvContent += `\nBalance Total, ,${balance.toFixed(2)},\n`;

    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transacciones.csv");
    document.body.appendChild(link);
    link.click();
}

function descargarPDF() {
    let transacciones = obtenerTransacciones();
    let balance = transacciones.reduce((sum, t) => sum + t.monto, 0);

    let contenido = "<h2>Lista de Transacciones</h2>";
    contenido += "<table border='1' style='width:100%; text-align:left;'><tr><th>Fecha</th><th>Descripción</th><th>Monto</th><th>Categoría</th></tr>";

    transacciones.forEach(t => {
        contenido += `<tr><td>${t.fecha}</td><td>${t.descripcion}</td><td>${t.monto.toFixed(2)}</td><td>${t.categoria}</td></tr>`;
    });

    contenido += `</table><br><h3>Balance Total: $${balance.toFixed(2)}</h3>`;

    let ventana = window.open("", "", "width=800,height=600");
    ventana.document.write(contenido);
    ventana.document.write('<button onclick="window.print()">Imprimir PDF</button>');
}


function toggleModoOscuro() {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("modoOscuro", document.body.classList.contains("dark-mode"));
}
