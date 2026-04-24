

// 🏛️ Departments & Branches
const branches = {
  Engineering: ["Computer Science", "Mechanical", "Civil", "Electronics"],
  Medical: ["Anatomy", "Pharmacy", "Pathology", "Microbiology"]
};

function selectDepartment(department) {
  goToSection("branchSection");
  document.getElementById("branchTitle").textContent = `${department} Branches`;
  const branchList = document.getElementById("branchList");
  branchList.innerHTML = "";

  branches[department].forEach(branch => {
    const btn = document.createElement("button");
    btn.textContent = branch;
    btn.onclick = () => showBooks(department, branch);
    branchList.appendChild(btn);
  });
}

// 📚 Book Manager
// Populate branch dropdown when department changes
document.getElementById("bookDepartment")?.addEventListener("change", function () {
  const dept = this.value;
  const branchSelect = document.getElementById("bookBranch");
  branchSelect.innerHTML = '<option value="">Select Branch</option>';

  if (branches[dept]) {
    branches[dept].forEach(branch => {
      const opt = document.createElement("option");
      opt.value = branch;
      opt.textContent = branch;
      branchSelect.appendChild(opt);
    });
  }
});

// ✅ Add Book (with image upload)
document.getElementById("addBookForm")?.addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = new FormData(this);

  let res = await fetch("books.php?action=add", {
    method: "POST",
    body: formData
  });

  try {
    let data = await res.json();
    if (data.success) {
      alert("✅ Book added successfully!");
      const dept = document.getElementById("bookDepartment").value;
      const branch = document.getElementById("bookBranch").value;
      if (dept && branch) {
        showBooks(dept, branch); // refresh list immediately
      }
      this.reset();
    } else {
      alert("⚠️ Failed to add book");
    }
  } catch (err) {
    alert("⚠️ Server error. Check books.php response.");
  }
});

// 📚 Show Books in branch (Excel-style table with image)
async function showBooks(department, branch) {
  goToSection("bookSection");
  const bookList = document.getElementById("bookList");
  bookList.innerHTML = "";

  let res = await fetch(`books.php?action=list&department=${department}&branch=${branch}`);
  let books = await res.json();

  if (!books || books.length === 0) {
    bookList.innerHTML = `<p style="text-align:center; font-size:18px; color:#555;">
      📚 No books available for <strong>${branch}</strong> branch yet.
    </p>`;
    return;
  }

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";
  table.innerHTML = `
    <thead>
      <tr>
        <th style="border:1px solid #555; padding:8px; background:#e6f7ff;">ID</th>
        <th style="border:1px solid #555; padding:8px; background:#e6f7ff;">Image</th>
        <th style="border:1px solid #555; padding:8px; background:#e6f7ff;">Title</th>
        <th style="border:1px solid #555; padding:8px; background:#e6f7ff;">Author</th>
        <th style="border:1px solid #555; padding:8px; background:#e6f7ff;">Cupboard</th>
        <th style="border:1px solid #555; padding:8px; background:#e6f7ff;">Action</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  books.forEach(book => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td style="border:1px solid #555; padding:8px; text-align:center;">${book.id}</td>
      <td style="border:1px solid #555; padding:8px; text-align:center;">
        ${book.image ? `<a href="${book.image}" target="_blank"><img src="${book.image}" style="width:60px;height:80px;object-fit:cover;border-radius:4px;" /></a>` : "📕"}
      </td>
      <td style="border:1px solid #555; padding:8px;">${book.title}</td>
      <td style="border:1px solid #555; padding:8px;">${book.author}</td>
      <td style="border:1px solid #555; padding:8px; text-align:center;">${book.cupboard}</td>
      <td style="border:1px solid #555; padding:8px; text-align:center;">
        <button onclick="deleteBook(${book.id}, '${department}', '${branch}')">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  bookList.appendChild(table);
}

// Delete book
async function deleteBook(id, department, branch) {
  await fetch("books.php?action=delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  });
  showBooks(department, branch);
}

// 👨‍🎓 Student Manager
const studentForm = document.getElementById("addStudentForm");
const studentList = document.getElementById("studentList");

// Format date for display
function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

// Add student record
studentForm?.addEventListener("submit", async function (e) {
  e.preventDefault();
  const studentId = document.getElementById("studentId").value.trim();
  const studentName = document.getElementById("studentName").value.trim();
  const issuedBook = document.getElementById("issuedBook").value.trim();
  const issueDate = document.getElementById("issueDate").value;
  const returnDate = document.getElementById("returnDate").value;

  let res = await fetch("students.php?action=add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId, studentName, issuedBook, issueDate, returnDate })
  });
  let data = await res.json();

  if (data.success) {
    renderStudentList();
    studentForm.reset();
  }
});

// List student records
async function renderStudentList() {
  studentList.innerHTML = "";
  let res = await fetch("students.php?action=list");
  let records = await res.json();

  if (!records || records.length === 0) {
    studentList.innerHTML = "<p>No student records found.</p>";
    return;
  }

  records.forEach(record => {
    const div = document.createElement("div");
    div.className = "student-record";
    div.innerHTML = `
      <p><strong>ID:</strong> ${record.student_id}</p>
      <p><strong>Name:</strong> ${record.student_name}</p>
      <p><strong>Book:</strong> ${record.issued_book}</p>
      <p><strong>Issued:</strong> ${formatDate(record.issue_date)}</p>
      <p><strong>Return:</strong> ${formatDate(record.return_date)}</p>
      <button onclick="deleteStudent(${record.id})">Delete</button>
    `;
    studentList.appendChild(div);
  });
}

// Delete student record
async function deleteStudent(id) {
  await fetch("students.php?action=delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  });
  renderStudentList();
}

// Auto-load student list when section is opened
document.querySelector("button[onclick=\"goToSection('studentSection')\"]")
  ?.addEventListener("click", renderStudentList);