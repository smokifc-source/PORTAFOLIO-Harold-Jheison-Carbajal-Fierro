package controlador;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Part;

@WebServlet("/archivo")
@MultipartConfig(
        fileSizeThreshold = 1024 * 1024,
        maxFileSize = 50 * 1024 * 1024,
        maxRequestSize = 60 * 1024 * 1024
)
public class archivo extends HttpServlet {

    private static final String CARPETA = "tareas";

    @Override
    protected void doPost(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        Part archivo = request.getPart("archivo");
        String curso = request.getParameter("curso");
        String unidad = request.getParameter("unidad");
        String semana = request.getParameter("semana");

        if (archivo == null || archivo.getSize() == 0) {
            response.sendError(
                    HttpServletResponse.SC_BAD_REQUEST,
                    "No se seleccionó ningún archivo"
            );
            return;
        }

        String nombreArchivo = Paths
                .get(archivo.getSubmittedFileName())
                .getFileName()
                .toString();

        // Limpiar datos para evitar problemas con nombres de carpetas
        curso = limpiarNombre(curso);
        unidad = limpiarNombre(unidad);
        semana = limpiarNombre(semana);

        // Carpeta donde se guardarán las tareas
        String rutaBase = getServletContext()
                .getRealPath("/")
                + CARPETA
                + File.separator
                + curso
                + File.separator
                + unidad
                + File.separator
                + semana;

        Path carpeta = Paths.get(rutaBase);

        Files.createDirectories(carpeta);

        Path destino = carpeta.resolve(nombreArchivo);

        try (InputStream input = archivo.getInputStream()) {
            Files.copy(
                    input,
                    destino,
                    StandardCopyOption.REPLACE_EXISTING
            );
        }

        response.setContentType("text/plain;charset=UTF-8");
        response.getWriter().write(
                "Tarea guardada correctamente"
        );
    }

    private String limpiarNombre(String texto) {

        if (texto == null || texto.trim().isEmpty()) {
            return "general";
        }

        return texto
                .replaceAll("[\\\\/:*?\"<>|]", "")
                .trim();
    }
}
