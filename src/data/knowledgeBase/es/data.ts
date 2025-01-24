export const esKnowledgeBase = [
  {
    id: "1",
    question: "¿Cómo creo un nuevo ticket de soporte?",
    answer: `
      <div class="space-y-6">
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p class="text-blue-800">¡Crear un nuevo ticket de soporte es fácil! Sigue estos sencillos pasos:</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">📝 Paso 1: Navegar</h3>
            <p>Haz clic en el botón "Crear Nuevo Ticket" en la barra de navegación lateral</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">✍️ Paso 2: Completar Detalles</h3>
            <ul class="list-disc pl-5 space-y-2">
              <li>Ingresa un título claro y breve que describa tu problema</li>
              <li>Proporciona información detallada en el campo de descripción</li>
              <li>Selecciona el nivel de prioridad apropiado</li>
            </ul>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">✅ Paso 3: Enviar</h3>
            <p>Haz clic en el botón "Enviar" para crear tu ticket</p>
          </div>
        </div>

        <div class="bg-green-50 rounded-lg p-4 border border-green-100">
          <p class="text-green-800">¡Nuestro equipo de soporte será notificado y responderá a tu ticket lo antes posible!</p>
        </div>
      </div>
    `,
    is_published: true
  },
  {
    id: "2",
    question: "¿Cómo puedo actualizar mi ticket con nueva información?",
    answer: `
      <div class="space-y-6">
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p class="text-blue-800">Puedes actualizar fácilmente tu ticket con nueva información siguiendo estos pasos:</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">1. Acceder a Tus Tickets</h3>
            <p>Ve a 'Mis Tickets' en el menú de navegación</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">2. Seleccionar Tu Ticket</h3>
            <p>Encuentra y haz clic en el ticket que deseas actualizar</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">3. Agregar Información</h3>
            <p>Haz clic en el botón 'Editar' y agrega tu nueva información</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">4. Guardar Cambios</h3>
            <p>Haz clic en 'Guardar' para actualizar tu ticket</p>
          </div>
        </div>
      </div>
    `,
    is_published: true
  },
  {
    id: "3",
    question: "¿Cómo puedo cambiar el idioma de la interfaz?",
    answer: `
      <div class="space-y-6">
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p class="text-blue-800">Cambiar el idioma de la interfaz es un proceso simple:</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">1. Acceder a Configuración</h3>
            <p>Haz clic en tu perfil en la esquina superior derecha</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">2. Buscar Configuración de Idioma</h3>
            <p>Selecciona 'Configuración' y busca la sección 'Preferencias de Idioma'</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">3. Seleccionar Idioma</h3>
            <p>Elige tu idioma preferido del menú desplegable</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">4. Aplicar Cambios</h3>
            <p>Los cambios se aplicarán inmediatamente</p>
          </div>
        </div>
      </div>
    `,
    is_published: true
  },
  {
    id: "4",
    question: "¿Qué significan los diferentes niveles de prioridad de los tickets?",
    answer: `
      <div class="space-y-6">
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p class="text-blue-800">Entender las prioridades de los tickets ayuda a asegurar un manejo adecuado de tus problemas:</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">🔴 Prioridad Alta</h3>
            <p>Problemas críticos que requieren atención inmediata</p>
            <ul class="list-disc pl-5 mt-2">
              <li>Problemas que afectan a todo el sistema</li>
              <li>Interrupciones del servicio</li>
              <li>Problemas de seguridad</li>
            </ul>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">🟡 Prioridad Media</h3>
            <p>Problemas importantes que necesitan resolverse pronto</p>
            <ul class="list-disc pl-5 mt-2">
              <li>Problemas de funcionalidad parcial</li>
              <li>Problemas de rendimiento</li>
              <li>Problemas recurrentes</li>
            </ul>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">🟢 Prioridad Baja</h3>
            <p>Problemas menores o consultas generales</p>
            <ul class="list-disc pl-5 mt-2">
              <li>Preguntas generales</li>
              <li>Solicitudes de funciones</li>
              <li>Problemas menores de interfaz</li>
            </ul>
          </div>
        </div>
      </div>
    `,
    is_published: true
  },
  {
    id: "5",
    question: "¿Cómo sé si un agente de soporte ha respondido a mi ticket?",
    answer: `
      <div class="space-y-6">
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p class="text-blue-800">Serás notificado de las respuestas de los agentes de varias maneras:</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">📧 Notificación por Email</h3>
            <p>Recibirás una notificación por email cuando haya una respuesta</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">🔔 Actualización del Panel</h3>
            <p>El estado del ticket se actualizará en tu panel de control</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">📝 Entrada en la Línea de Tiempo</h3>
            <p>Podrás ver la respuesta en la línea de tiempo del ticket</p>
          </div>
        </div>
      </div>
    `,
    is_published: true
  },
  {
    id: "6",
    question: "¿Puedo reabrir un ticket cerrado?",
    answer: `
      <div class="space-y-6">
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p class="text-blue-800">Sí, puedes reabrir un ticket cerrado siguiendo estos pasos:</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">1. Encontrar Tu Ticket</h3>
            <p>Ve a 'Mis Tickets' y localiza el ticket cerrado</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">2. Acción de Reapertura</h3>
            <p>Haz clic en el botón 'Reabrir Ticket'</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">3. Proporcionar Razón</h3>
            <p>Explica por qué estás reabriendo el ticket</p>
          </div>
        </div>

        <div class="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
          <p class="text-yellow-800">Nota: Si el problema está relacionado pero es diferente, te recomendamos crear un nuevo ticket.</p>
        </div>
      </div>
    `,
    is_published: true
  },
  {
    id: "7",
    question: "¿Cómo puedo ver mi historial de tickets?",
    answer: `
      <div class="space-y-6">
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p class="text-blue-800">Puedes ver tu historial completo de tickets en unos simples pasos:</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">1. Acceder a Tickets</h3>
            <p>Ve a 'Mis Tickets' en el menú de navegación</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">2. Ver Lista</h3>
            <p>Verás una lista de todos tus tickets</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">3. Opciones de Filtrado</h3>
            <p>Usa los filtros para ordenar por estado (Abierto, Cerrado, etc.)</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">4. Ver Detalles</h3>
            <p>Haz clic en cualquier ticket para ver su historial completo</p>
          </div>
        </div>
      </div>
    `,
    is_published: true
  },
  {
    id: "8",
    question: "¿Cómo puedo gestionar las notificaciones por email de mis tickets?",
    answer: `
      <div class="space-y-6">
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p class="text-blue-800">Puedes personalizar tus notificaciones por email en tu configuración de perfil:</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">1. Acceder a Configuración</h3>
            <p>Ve a la Configuración de tu Perfil</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">2. Preferencias de Notificación</h3>
            <p>Encuentra la sección 'Preferencias de Notificación'</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">3. Elegir Notificaciones</h3>
            <ul class="list-disc pl-5 space-y-2">
              <li>Actualizaciones de tickets</li>
              <li>Respuestas de agentes</li>
              <li>Cambios de estado</li>
              <li>Recordatorios</li>
            </ul>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">4. Guardar Preferencias</h3>
            <p>No olvides guardar tus preferencias de notificación</p>
          </div>
        </div>
      </div>
    `,
    is_published: true
  }
]; 