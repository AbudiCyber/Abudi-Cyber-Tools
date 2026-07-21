# Abudi-Cyber-Tools

```python
def clean_result(value):
    if value == int(value):  
        return int(value)    
    return value             

def add(a, b):
    return a + b

def subtract(a, b):
    return a - b

def multiply(a, b):
    return a * b

def divide(a, b):
    if b == 0:
        return "Error! Division by zero."
    return a / b


while True:
    print("\n===== Simple Calculator =====")
    print("1. Add")
    print("2. Subtract")
    print("3. Multiply")
    print("4. Divide")
    print("5. Exit")

    choice = input("Enter your choice (1-5): ")

    if choice == "5":
        print("Thank you for using the calculator!")
        break

    if choice not in ["1", "2", "3", "4"]:
        print("Invalid choice. Please try again.")
        continue

    try:
        num1 = float(input("Enter first number: "))
        num2 = float(input("Enter second number: "))

        # هنا تم تعديل أسطر الطباعة لاستخدام دالة clean_result
        if choice == "1":
            print("Result =", clean_result(add(num1, num2)))
        elif choice == "2":
            print("Result =", clean_result(subtract(num1, num2)))
        elif choice == "3":
            print("Result =", clean_result(multiply(num1, num2)))
        elif choice == "4":
            print("Result =", clean_result(divide(num1, num2)))

    except ValueError:
        print("Please enter valid numbers.")
```
