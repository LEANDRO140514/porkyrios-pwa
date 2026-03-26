"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Gift, Users, Award, ShieldCheck, AlertCircle } from "lucide-react";

export default function PoliticasReferidosPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF6B35]/5 to-[#FF8E53]/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Inicio
          </Button>

          <div className="bg-gradient-to-r from-[#FF6B35] to-[#FF8E53] text-white rounded-2xl p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Gift className="w-10 h-10" />
              <h1 className="text-3xl md:text-4xl font-bold">
                Políticas del Programa de Referidos
              </h1>
            </div>
            <p className="text-white/90 text-lg">
              Términos y condiciones del programa "Invita un Amigo" de Porkyrios
            </p>
            <p className="text-white/80 text-sm mt-2">
              Última actualización: 21 de noviembre de 2025
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* 1. Descripción del Programa */}
          <section className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-[#FF6B35]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-[#FF6B35]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  1. Descripción del Programa
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  El programa de referidos "Invita un Amigo" de Porkyrios permite a nuestros 
                  clientes registrados compartir su código único de referido con amigos y 
                  familiares. Cuando una persona nueva se registra usando tu código, ambos 
                  reciben descuentos especiales en sus pedidos.
                </p>
              </div>
            </div>
          </section>

          {/* 2. Elegibilidad */}
          <section className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  2. Elegibilidad
                </h2>
                <div className="space-y-3 text-gray-700">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Para Referidores:</h3>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Debes tener una cuenta activa en Porkyrios</li>
                      <li>Tu cuenta debe estar en buen estado (sin sanciones o fraudes)</li>
                      <li>Debes haber completado al menos un pedido exitosamente</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Para Referidos:</h3>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Deben ser usuarios nuevos (sin cuenta previa en Porkyrios)</li>
                      <li>Deben registrarse usando un código de referido válido</li>
                      <li>Una persona solo puede ser referida una vez</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Recompensas */}
          <section className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  3. Recompensas y Descuentos
                </h2>
                
                {/* Rewards Grid */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gradient-to-br from-[#FF6B35]/10 to-[#FF8E53]/10 rounded-lg p-4 border-2 border-[#FF6B35]/20">
                    <div className="text-2xl font-bold text-[#FF6B35] mb-1">15% OFF</div>
                    <div className="font-semibold text-gray-900 mb-2">Para el Referidor</div>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Código de cupón único</li>
                      <li>• Válido en tu próximo pedido</li>
                      <li>• Sin compra mínima</li>
                      <li>• Válido por 30 días</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-200">
                    <div className="text-2xl font-bold text-blue-600 mb-1">10% OFF</div>
                    <div className="font-semibold text-gray-900 mb-2">Para el Referido (Nuevo Usuario)</div>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Cupón de bienvenida</li>
                      <li>• Válido en tu primer pedido</li>
                      <li>• Sin compra mínima</li>
                      <li>• Válido por 30 días</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <p className="text-sm text-gray-700">
                    <strong>Nota:</strong> Los cupones se generan automáticamente cuando el 
                    nuevo usuario completa su registro. Ambos usuarios recibirán notificaciones 
                    con sus códigos de descuento.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Cómo Funciona */}
          <section className="bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              4. Cómo Funciona el Proceso
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-[#FF6B35] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Obtén tu Código</h3>
                  <p className="text-gray-700 text-sm">
                    Accede a "Invita un Amigo" desde tu cuenta y obtén tu código único de referido.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-[#FF6B35] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Comparte tu Código</h3>
                  <p className="text-gray-700 text-sm">
                    Comparte tu código mediante redes sociales, WhatsApp, o copia el link directo.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-[#FF6B35] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Tu Amigo se Registra</h3>
                  <p className="text-gray-700 text-sm">
                    El nuevo usuario debe ingresar tu código durante el registro o usar el link compartido.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-[#FF6B35] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Ambos Reciben Recompensas</h3>
                  <p className="text-gray-700 text-sm">
                    Se generan automáticamente los cupones de descuento para ambos usuarios.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 5. Términos y Restricciones */}
          <section className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  5. Términos y Restricciones
                </h2>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6B35] font-bold mt-1">•</span>
                    <span>Los códigos de referido no tienen fecha de expiración y pueden usarse ilimitadamente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6B35] font-bold mt-1">•</span>
                    <span>Los cupones de descuento generados tienen validez de 30 días desde su creación</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6B35] font-bold mt-1">•</span>
                    <span>No hay límite en la cantidad de personas que puedes referir</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6B35] font-bold mt-1">•</span>
                    <span>Los cupones no son acumulables con otras promociones (salvo excepciones específicas)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6B35] font-bold mt-1">•</span>
                    <span>Los cupones no pueden canjearse por dinero en efectivo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6B35] font-bold mt-1">•</span>
                    <span>Cada usuario nuevo solo puede usar un código de referido al registrarse</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6B35] font-bold mt-1">•</span>
                    <span>No se permite la creación de cuentas falsas o fraudulentas</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 6. Prohibiciones */}
          <section className="bg-red-50 border-l-4 border-red-500 rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-red-900 mb-3">
              6. Actividades Prohibidas
            </h2>
            <p className="text-red-800 mb-3">
              Las siguientes actividades están estrictamente prohibidas y resultarán en la 
              suspensión del programa y/o cuenta:
            </p>
            <ul className="space-y-2 text-red-800">
              <li className="flex items-start gap-2">
                <span className="font-bold mt-1">✖</span>
                <span>Crear múltiples cuentas falsas para auto-referirse</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-1">✖</span>
                <span>Usar bots o sistemas automatizados para generar referidos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-1">✖</span>
                <span>Compartir códigos de forma engañosa o fraudulenta</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-1">✖</span>
                <span>Abusar del sistema de referidos de cualquier manera</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-1">✖</span>
                <span>Comprar o vender códigos de referido</span>
              </li>
            </ul>
          </section>

          {/* 7. Suspensión y Cancelación */}
          <section className="bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              7. Suspensión y Cancelación
            </h2>
            <p className="text-gray-700 mb-3">
              Porkyrios se reserva el derecho de:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-[#FF6B35] font-bold mt-1">•</span>
                <span>Suspender o cancelar la participación en el programa de referidos si se detecta abuso o fraude</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF6B35] font-bold mt-1">•</span>
                <span>Revocar cupones obtenidos de manera fraudulenta</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF6B35] font-bold mt-1">•</span>
                <span>Modificar o descontinuar el programa con previo aviso de 30 días</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF6B35] font-bold mt-1">•</span>
                <span>Investigar actividades sospechosas y tomar acciones correspondientes</span>
              </li>
            </ul>
          </section>

          {/* 8. Cambios a las Políticas */}
          <section className="bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              8. Modificaciones a las Políticas
            </h2>
            <p className="text-gray-700">
              Porkyrios se reserva el derecho de modificar estas políticas en cualquier momento. 
              Los cambios serán notificados a través de nuestro sitio web y/o correo electrónico. 
              El uso continuado del programa después de las modificaciones constituye la aceptación 
              de los nuevos términos.
            </p>
          </section>

          {/* 9. Contacto */}
          <section className="bg-gradient-to-br from-[#FF6B35]/10 to-[#FF8E53]/10 rounded-xl p-6 shadow-md border-2 border-[#FF6B35]/20">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              9. Contacto y Soporte
            </h2>
            <p className="text-gray-700 mb-3">
              Si tienes preguntas sobre el programa de referidos o estas políticas, contáctanos:
            </p>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Email:</strong>{" "}
                <a href="mailto:referidos@porkyrios.com" className="text-[#FF6B35] hover:underline">
                  referidos@porkyrios.com
                </a>
              </p>
              <p>
                <strong>Soporte:</strong>{" "}
                <a href="mailto:soporte@porkyrios.com" className="text-[#FF6B35] hover:underline">
                  soporte@porkyrios.com
                </a>
              </p>
            </div>
          </section>
        </div>

        {/* Footer CTA */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => router.push("/")}
            size="lg"
            className="bg-[#FF6B35] text-white hover:bg-[#FF5722] text-lg px-8 py-6 h-auto font-bold shadow-xl"
          >
            <Gift className="w-5 h-5 mr-2" />
            Comenzar a Referir Amigos
          </Button>
        </div>

        {/* Legal Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>© 2025 Porkyrios. Todos los derechos reservados.</p>
          <p className="mt-1">
            Al participar en el programa de referidos, aceptas estos términos y condiciones.
          </p>
        </div>
      </div>
    </div>
  );
}
