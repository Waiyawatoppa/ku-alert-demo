/* ===================================
   REPAIR FORM JAVASCRIPT - FIXED VERSION
   =================================== */

// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyBDPIi5jATazCUMZ7u-Wa2701z8h8mCM2M",
  authDomain: "ku-alert.firebaseapp.com",
  projectId: "ku-alert",
  storageBucket: "ku-alert.firebasestorage.app",
  messagingSenderId: "619349379112",
  appId: "1:619349379112:web:efa015a517bde9fc86cd1d",
  measurementId: "G-JTQR0511PY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();

// Authentication state handler
onAuthStateChanged(auth, (user) => {
  console.log("AUTH STATE:", user);
  if (user && user.email.endsWith('@ku.th')) {
    const userInfoEl = document.querySelector('.user-info-text');
    if (userInfoEl) {
      const name = user.displayName || user.email.split('@')[0];
      const photoURL = user.photoURL || 'default-avatar.png';
      userInfoEl.innerHTML = `
        <img src="${photoURL}" alt="User Avatar" style="width:32px; height:32px; border-radius:50%; vertical-align:middle; margin-right:8px;" onerror="this.style.display='none'">
        สวัสดี ${name} (${user.email})
      `;
    }
  } else {
    console.log("redirecting to login.html...");
    window.location.href = 'login.html';
  }
});

// Logout functionality
document.addEventListener('DOMContentLoaded', function() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await signOut(auth);
        window.location.href = 'login.html';
      } catch (error) {
        console.error('Error signing out:', error);
      }
    });
  }
});

// === GLOBAL VARIABLES ===
let currentStep = 0;
const steps = document.querySelectorAll('.step');
const progressBar = document.getElementById('progressBar');
const totalSteps = steps.length;

// === DOM ELEMENTS ===
const elements = {
  form: document.getElementById('repairForm'),
  imageInput: document.getElementById('imageInput'),
  imagePreview: document.getElementById('imagePreview'),
  submitModal: document.getElementById('submitModal'),
  imageZoomModal: document.getElementById('imageZoomModal'),
  zoomedImage: document.getElementById('zoomedImage'),
  // Preview elements
  previewDepartment: document.getElementById('previewDepartment'),
  previewProblemType: document.getElementById('previewProblemType'),
  previewSubject: document.getElementById('previewSubject'),
  previewDetails: document.getElementById('previewDetails'),
  previewSeverity: document.getElementById('previewSeverity'),
  previewImages: document.getElementById('previewImages'),
};

// === STEP MANAGEMENT ===
function showStep(index) {
  console.log('Showing step:', index);
  steps.forEach((step, i) => {
    step.classList.toggle('active', i === index);
  });

  const progressPercent = ((index + 1) / totalSteps) * 100;
  progressBar.style.width = `${progressPercent}%`;
  progressBar.setAttribute('aria-valuenow', progressPercent);

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextStep() {
  console.log('Next button clicked, current step:', currentStep);
  if (!validateStep()) {
    console.log('Validation failed');
    return;
  }

  if (currentStep < totalSteps - 1) {
    currentStep++;
    showStep(currentStep);
    console.log('Moved to step:', currentStep);
  }
}

function prevStep() {
  console.log('Prev button clicked, current step:', currentStep);
  if (currentStep > 0) {
    currentStep--;
    showStep(currentStep);
    console.log('Moved to step:', currentStep);
  }
}

// === VALIDATION ===
function validateStep() {
  console.log('Validating step:', currentStep);
  let valid = true;
  const currentStepElement = steps[currentStep];
  const fieldsToValidate = Array.from(currentStepElement.querySelectorAll('select[required], input[required], textarea[required]'));

  console.log('Fields to validate:', fieldsToValidate.length);

  fieldsToValidate.forEach(field => {
    let fieldIsValid = true;

    if (field.tagName === 'SELECT') {
      if (field.value === "" || field.value === null) {
        fieldIsValid = false;
      }
    } else if (field.type === 'file') {
      // Handled in specific image validation below
    } else {
      if (!field.value.trim()) {
        fieldIsValid = false;
      }
    }

    if (!fieldIsValid) {
      valid = false;
      field.classList.add('is-invalid');
      console.log('Field invalid:', field.id, 'Value:', field.value);
    } else {
      field.classList.remove('is-invalid');
      console.log('Field valid:', field.id, 'Value:', field.value);
    }
  });

  // Special validation for image upload step (step index 1)
  if (currentStep === 1) {
    const files = elements.imageInput.files;
    if (files.length < 1 || files.length > 10) {
      elements.imageInput.classList.add('is-invalid');
      valid = false;
      console.log('Image validation failed, files count:', files.length);
    } else {
      elements.imageInput.classList.remove('is-invalid');
      console.log('Image validation passed');
    }
  }

  console.log('Step validation result:', valid);
  return valid;
}

// === IMAGE HANDLING ===
function handleImageSelection() {
  console.log('Image selection changed');
  const files = elements.imageInput.files;
  elements.imagePreview.innerHTML = ''; // Clear previous previews

  // Validate number of files immediately
  if (files.length < 1 || files.length > 10) {
    elements.imageInput.classList.add('is-invalid');
  } else {
    elements.imageInput.classList.remove('is-invalid');
  }

  Array.from(files).forEach((file, index) => {
    createImagePreview(file, index);
  });
}

function createImagePreview(file, index) {
  const reader = new FileReader();

  reader.onload = function(e) {
    const img = createImageElement(e.target.result, `รูปภาพประกอบ ${index + 1}`);
    elements.imagePreview.appendChild(img);
  };

  reader.readAsDataURL(file);
}

function createImageElement(src, alt) {
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  img.className = 'img-thumb';
  img.tabIndex = 0;
  img.style.cursor = 'pointer';
  img.style.width = '100px';
  img.style.height = '100px';
  img.style.objectFit = 'cover';
  img.style.margin = '5px';
  img.style.border = '1px solid #ddd';
  img.style.borderRadius = '4px';

  img.addEventListener('click', () => openImageZoom(src));
  img.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openImageZoom(src);
    }
  });

  return img;
}

function openImageZoom(src) {
  elements.zoomedImage.src = src;
  const modal = new bootstrap.Modal(elements.imageZoomModal);
  modal.show();
}

// === PREVIEW PREPARATION ===
function preparePreview() {
  console.log('Preview button clicked');
  if (!validateStep()) return;

  populatePreviewData();
  generatePreviewImages();

  nextStep();
}

function populatePreviewData() {
  const formData = getFormData();

  elements.previewDepartment.textContent = formData.department || '-';
  elements.previewProblemType.textContent = formData.problemType || '-';
  elements.previewSubject.textContent = formData.subject || '-';
  elements.previewDetails.textContent = formData.details || '-';
  elements.previewSeverity.textContent = formData.severity || '-';
}

function generatePreviewImages() {
  elements.previewImages.innerHTML = '';
  const files = elements.imageInput.files;

  Array.from(files).forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = createImageElement(e.target.result, `รูปภาพประกอบ ${index + 1}`);
      elements.previewImages.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

function getFormData() {
  return {
    department: document.getElementById('department')?.value || '',
    problemType: document.getElementById('problemType')?.value || '',
    subject: document.getElementById('subject')?.value || '',
    details: document.getElementById('details')?.value || '',
    severity: document.getElementById('severity')?.value || '',
    images: elements.imageInput.files
  };
}

// === FORM SUBMISSION ===
function handleFormSubmission(e) {
  e.preventDefault();
  console.log('Submit button clicked');

  if (!validateStep()) {
      console.log('Final validation failed on submit.');
      return;
  }

  const formData = getFormData();
  console.log('Form submitted:', formData);

  // In a real application, you would send this formData to a server
  // Example: fetch('/api/submit-form', { method: 'POST', body: JSON.stringify(formData) })

  showSuccessModal();
}

function showSuccessModal() {
  const modal = new bootstrap.Modal(elements.submitModal);
  modal.show();

  elements.submitModal.addEventListener('hidden.bs.modal', handleModalClose, { once: true });
}

function handleModalClose() {
  resetForm();
  currentStep = 0;
  showStep(currentStep);
}

function resetForm() {
  elements.form.reset();
  elements.imagePreview.innerHTML = '';
  elements.previewImages.innerHTML = '';

  const invalidFields = elements.form.querySelectorAll('.is-invalid');
  invalidFields.forEach(field => field.classList.remove('is-invalid'));
}

// === EVENT LISTENERS SETUP ===
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, setting up event listeners');

  // Add Event Listener for dropdowns to remove is-invalid class immediately on change
  const departmentSelect = document.getElementById('department');
  const problemTypeSelect = document.getElementById('problemType');

  if (departmentSelect) {
    departmentSelect.addEventListener('change', function() {
      if (this.value !== "" && this.value !== null) {
        this.classList.remove('is-invalid');
        console.log('Department select changed, removed is-invalid. Value:', this.value);
      } else {
        this.classList.add('is-invalid');
        console.log('Department select changed, added is-invalid (empty value). Value:', this.value);
      }
    });
  }

  if (problemTypeSelect) {
    problemTypeSelect.addEventListener('change', function() {
      if (this.value !== "" && this.value !== null) {
        this.classList.remove('is-invalid');
        console.log('ProblemType select changed, removed is-invalid. Value:', this.value);
      } else {
        this.classList.add('is-invalid');
        console.log('ProblemType select changed, added is-invalid (empty value). Value:', this.value);
      }
    });
  }

  // Step 1 navigation
  const nextBtn1 = document.getElementById('nextBtn1');
  if (nextBtn1) {
    nextBtn1.addEventListener('click', nextStep);
    console.log('nextBtn1 listener added');
  }

  // Step 2 navigation
  const nextBtn2 = document.getElementById('nextBtn2');
  const prevBtn2 = document.getElementById('prevBtn2');
  if (nextBtn2) {
    nextBtn2.addEventListener('click', nextStep);
    console.log('nextBtn2 listener added');
  }
  if (prevBtn2) {
    prevBtn2.addEventListener('click', prevStep);
    console.log('prevBtn2 listener added');
  }

  // Step 3 navigation
  const nextBtn3 = document.getElementById('nextBtn3');
  const prevBtn3 = document.getElementById('prevBtn3');
  if (nextBtn3) {
    nextBtn3.addEventListener('click', nextStep);
    console.log('nextBtn3 listener added');
  }
  if (prevBtn3) {
    prevBtn3.addEventListener('click', prevStep);
    console.log('prevBtn3 listener added');
  }

  // Step 4 navigation
  const previewBtn = document.getElementById('previewBtn');
  const prevBtn4 = document.getElementById('prevBtn4');
  if (previewBtn) {
    previewBtn.addEventListener('click', preparePreview);
    console.log('previewBtn listener added');
  }
  if (prevBtn4) {
    prevBtn4.addEventListener('click', prevStep);
    console.log('prevBtn4 listener added');
  }

  // Step 5 navigation
  const prevBtn5 = document.getElementById('prevBtn5');
  if (prevBtn5) {
    prevBtn5.addEventListener('click', prevStep);
    console.log('prevBtn5 listener added');
  }

  // Image input
  if (elements.imageInput) {
    elements.imageInput.addEventListener('change', handleImageSelection);
    console.log('imageInput listener added');
  }

  // Form submission
  if (elements.form) {
    elements.form.addEventListener('submit', handleFormSubmission);
    console.log('form submit listener added');
  }

  // Initialize first step
  showStep(currentStep);
  console.log('Initial step shown');
});