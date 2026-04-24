<?php
require "db.php";

$action = $_GET['action'] ?? '';

if ($action === "add") {
    $department = $_POST['department'] ?? '';
    $branch     = $_POST['branch'] ?? '';
    $title      = $_POST['title'] ?? '';
    $author     = $_POST['author'] ?? '';
    $cupboard   = $_POST['cupboard'] ?? '';
    $imagePath  = null;

    // Handle image upload
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = "uploads/books/";
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        $fileName = time() . "_" . basename($_FILES['image']['name']);
        $targetFile = $uploadDir . $fileName;

        if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFile)) {
            $imagePath = $targetFile;
        }
    }

    $stmt = $pdo->prepare("INSERT INTO books (department, branch, title, author, cupboard, image) VALUES (?, ?, ?, ?, ?, ?)");
    $success = $stmt->execute([$department, $branch, $title, $author, $cupboard, $imagePath]);

    echo json_encode(["success" => $success]);
    exit;
}

elseif ($action === "list") {
    $dept = $_GET['department'] ?? '';
    $branch = $_GET['branch'] ?? '';
    $stmt = $pdo->prepare("SELECT * FROM books WHERE department=? AND branch=? ORDER BY id DESC");
    $stmt->execute([$dept, $branch]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

elseif ($action === "delete") {
    $data = json_decode(file_get_contents("php://input"), true);
    $stmt = $pdo->prepare("DELETE FROM books WHERE id=?");
    $stmt->execute([$data['id']]);
    echo json_encode(["success" => true]);
    exit;
}
?>
