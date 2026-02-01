// =====================================================================
// 🔓 INTERCEPTOR DE BYPASS PARA DESARROLLO
// =====================================================================
// Agrega automáticamente el header X-Dev-Bypass en todas las peticiones
// Solo se activa cuando environment.production === false
// =====================================================================

import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

/**
 * Interceptor funcional para Angular 21+
 * Inyecta el header X-Dev-Bypass en modo desarrollo
 */
export const devBypassInterceptor: HttpInterceptorFn = (req, next) => {

    // Solo ejecutar en modo desarrollo
    if (!environment.production) {

        // Clonar la petición HTTP original
        const clonedReq = req.clone({
            setHeaders: {
                'X-Token-Dev': 'DESARROLLO_2025' // Token mágico del backend
            }
        });

        // Log de debugging (opcional - puedes comentarlo después)
        console.log('🔓 Bypass activo para:', req.url);

        // Continuar con la petición modificada
        return next(clonedReq);
    }

    // En producción, dejar la petición sin modificar
    return next(req);
};
