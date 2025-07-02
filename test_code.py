def fibonacci(n):
    if n <= 1:
        return n
    else:
        return fibonacci(n-1) + fibonacci(n-2)

# This function could be optimized
def factorial(n):
    if n == 0:
        return 1
    else:
        return n * factorial(n-1)

print("Hello World!") 