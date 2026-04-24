<?php
require "db.php";

$action = $_GET['action'] ?? '';

if ($action === "add") {
    $data = json_decode(file_get_contents("php://input"), true);
    $stmt = $pdo->prepare("INSERT INTO student_records 
        (student_id, student_name, issued_book, issue_date, return_date) 
        VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([
        $data['studentId'], 
        $data['studentName'], 
        $data['issuedBook'], 
        $data['issueDate'], 
        $data['returnDate']
    ]);

    // Get the newly inserted record
    $lastId = $pdo->lastInsertId();
    $stmt = $pdo->prepare("SELECT * FROM student_records WHERE id=?");
    $stmt->execute([$lastId]);
    $newRecord = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "record" => $newRecord
    ]);
}

elseif ($action === "list") {
    $stmt = $pdo->query("SELECT * FROM student_records ORDER BY id DESC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

elseif ($action === "delete") {
    $data = json_decode(file_get_contents("php://input"), true);
    $stmt = $pdo->prepare("DELETE FROM student_records WHERE id=?");
    $stmt->execute([$data['id']]);
    echo json_encode(["success" => true]);
}
?>
