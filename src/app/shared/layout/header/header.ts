import { Component } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { AshaLogoComponent } from '../asha-logo.component/asha-logo.component';
import { HttpAuth } from '../../../core/services/http-auth';
import { AsyncPipe } from '@angular/common';
import { HttpUsers } from '../../../core/services/http-users';
// import { AshaLogoComponent } from ... (Descomenta cuando tengas el logo)

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, AshaLogoComponent, AsyncPipe], // Agrega AshaLogoComponent aquí también
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

  constructor(
    public httpAuth: HttpAuth,
    public httpUsers: HttpUsers,
    private router: Router
  ) { }


  // --- ESTADO DEL MENÚ PRINCIPAL (Hamburguesa) ---
  isMenuOpen = false;

  // --- ESTADO DEL USUARIO --- TEST
  ngOnInit(): void {
    this.httpAuth.currentUser$.subscribe((user) => {
      console.log('🟢 HttpAuth currentUser$', user);
    });
  }
  // FIN DEL TEST

  // --- ESTADO DE LOS SUBMENÚS (Acordeón) ---
  // Guardaremos el nombre del menú abierto (ej: 'users', 'clients'). 
  // Si es null, todos están cerrados.
  activeDropdown: string | null = null;

  // 1. Abrir/Cerrar el menú principal (Hamburguesa)
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    // Opcional: Si cerramos el menú principal, reiniciamos los submenús
    if (!this.isMenuOpen) {
      this.activeDropdown = null;
    }
  }

  // 2. Abrir/Cerrar un submenú específico (Users, Clients...)
  toggleDropdown(section: string) {
    // Si la sección que toqué ya está abierta, la cierro (null)
    // Si no, la abro (section)
    this.activeDropdown = this.activeDropdown === section ? null : section;
  }

  // 3. Cerrar TODO al hacer clic en un enlace final
  closeMenu() {
    this.isMenuOpen = false;      // Cierra la hamburguesa
    this.activeDropdown = null;   // Cierra los acordeones internos
  }

  onLogout() {
    console.log("Cerrando sesion");
    // Limpia el local storage
    this.httpAuth.logout();
    // Redirecciona a la pagina de login
    this.router.navigate(['/login']);
  }
}