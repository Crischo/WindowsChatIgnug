import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { Cuenta } from '../../entidades/CRUD/Cuenta';
import { CuentaService } from './cuenta.service';

import 'rxjs/add/operator/toPromise';
import { ModalComponent } from 'app/layout/bs-component/components';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';

@Component({
   selector: 'app-cuenta',
   templateUrl: './cuenta.component.html',
   styleUrls: ['./cuenta.component.scss']
})

export class CuentaComponent implements OnInit {

   busy: Promise<any>;
   entidades: Cuenta[];
   entidadSeleccionada: Cuenta;
   pagina: 1;
   tamanoPagina: 20;
   paginaActual: number;
   paginaUltima: number;
   registrosPorPagina: number;
   esVisibleVentanaEdicion: boolean;

   constructor(public toastr: ToastsManager, vcr: ViewContainerRef, private dataService: CuentaService, private modalService: NgbModal) {
      this.toastr.setRootViewContainerRef(vcr);
   }

   open(content, nuevo){
      if(nuevo){
         this.resetEntidadSeleccionada();
      }
      this.modalService.open(content)
      .result
      .then((result => {
         if(result=="save"){
            this.aceptar();
         }
      }),(result => {
         //Esto se ejecuta si la ventana se cierra sin aceptar los cambios
      }));
   }

   estaSeleccionado(porVerificar): boolean {
      if (this.entidadSeleccionada == null) {
         return false;
      }
      return porVerificar.id === this.entidadSeleccionada.id;
   }

   cerrarVentanaEdicion(): void {
      this.esVisibleVentanaEdicion = false;
   }

   mostrarVentanaNuevo(): void {
      this.resetEntidadSeleccionada();
      this.esVisibleVentanaEdicion = true;
   }

   mostrarVentanaEdicion(): void {
      this.esVisibleVentanaEdicion = true;
   }

   resetEntidadSeleccionada(): void {
      this.entidadSeleccionada = this.crearEntidad();
   }

   getAll(): void {
      this.busy = this.dataService
      .getAll()
      .then(entidadesRecuperadas => {
         this.entidades = entidadesRecuperadas
         if (entidadesRecuperadas == null || entidadesRecuperadas.length === 0) {
            this.toastr.success('¡No hay datos!', 'Consulta');
         } else {
            this.toastr.success('La consulta fue exitosa', 'Consulta');
         }
      })
      .catch(error => {
         this.toastr.success('Se produjo un error', 'Consulta');
      });
   }

   getPagina(pagina: number, tamanoPagina: number): void {
      this.busy = this.dataService
      .getPagina(pagina, tamanoPagina)
      .then(entidadesRecuperadas => {
         this.entidades = entidadesRecuperadas
         if (entidadesRecuperadas == null || entidadesRecuperadas.length === 0) {
            this.toastr.success('¡No hay datos!', 'Consulta');
         } else {
            this.toastr.success('La consulta fue exitosa', 'Consulta');
         }
      })
      .catch(error => {
         this.toastr.success('Se produjo un error', 'Consulta');
      });
   }

   getNumeroPaginas(tamanoPagina: number): void{
      this.busy = this.dataService
      .getNumeroPaginas(tamanoPagina)
      .then(respuesta => {
         this.paginaUltima = respuesta.paginas;
      })
      .catch(error => {
         //Error al leer las paginas
      });
   }

   isValid(entidadPorEvaluar: Cuenta): boolean {
      return true;
   }

   aceptar(): void {
      if (!this.isValid(this.entidadSeleccionada)) {return;}
      if (this.entidadSeleccionada.id === undefined || this.entidadSeleccionada.id === 0) {
         this.add(this.entidadSeleccionada);
      } else {
         this.update(this.entidadSeleccionada);
      }
      this.cerrarVentanaEdicion();
   }

   crearEntidad(): Cuenta {
      const nuevoCuenta = new Cuenta();
      nuevoCuenta.id = 0;
      return nuevoCuenta;
   }

   add(entidadNueva: Cuenta): void {
      this.busy = this.dataService.create(entidadNueva)
      .then(respuesta => {
         if(respuesta){
            this.toastr.success('La creación fue exitosa', 'Creación');
         }else{
            this.toastr.warning('Se produjo un error', 'Creación');
         }
         this.refresh();
      })
      .catch(error => {
         this.toastr.warning('Se produjo un error', 'Creación');
      });
   }

   update(entidadParaActualizar: Cuenta): void {
      this.busy = this.dataService.update(entidadParaActualizar)
      .then(respuesta => {
         if(respuesta){
            this.toastr.success('La actualización fue exitosa', 'Actualización');
         }else{
            this.toastr.warning('Se produjo un error', 'Actualización');
         }
         this.refresh();
      })
      .catch(error => {
         this.toastr.warning('Se produjo un error', 'Actualización');
      });
   }

   delete(entidadParaBorrar: Cuenta): void {
      this.busy = this.dataService.remove(entidadParaBorrar.id)
      .then(respuesta => {
         if(respuesta){
            this.toastr.success('La eliminación fue exitosa', 'Eliminación');
         }else{
            this.toastr.warning('Se produjo un error', 'Eliminación');
         }
         this.refresh();
      })
      .catch(error => {
         this.toastr.success('Se produjo un error', 'Eliminación');
      });
   }

   refresh(): void {
      this.getNumeroPaginas(this.registrosPorPagina);
      this.getPagina(this.paginaActual,this.registrosPorPagina);
      this.entidades = Cuenta[0];
      this.entidadSeleccionada = this.crearEntidad();
   }

   getPaginaPrimera():void {
      this.paginaActual = 1;
      this.refresh();
   }

   getPaginaAnterior():void {
      if(this.paginaActual>1){
         this.paginaActual = this.paginaActual - 1;
         this.refresh();
      }
   }

   getPaginaSiguiente():void {
      if(this.paginaActual < this.paginaUltima){
         this.paginaActual = this.paginaActual + 1;
         this.refresh();
      }
   }

   getPaginaUltima():void {
      this.paginaActual = this.paginaUltima;
      this.refresh();
   }

   ngOnInit() {
      this.paginaActual=1;
      this.registrosPorPagina = 5;
      this.refresh();
   }

   onSelect(entidadActual: Cuenta): void {
      this.entidadSeleccionada = entidadActual;
   }
}
