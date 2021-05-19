import socket
import threading
from datetime import datetime
from netaddr import *
import math

global_lock = threading.Lock()

#sock_type = socket.SOCK_STREAM
sock_type = socket.SOCK_DGRAM

def port_scan(from_ip,to_ip, arr):
    if from_ip > to_ip or from_ip == to_ip:
        return
    
    port = 3128

    for i in range(from_ip, to_ip):
        host = str(IPAddress(i))
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(0.5)
            s.connect((host, port))
            print(str(host) + ':' + str(port))
            
            with open("nets.txt", "a+") as file:
                file.write(str(host) + ':' + str(port)+'\n')
                file.close()
            
            s.close()
        except (socket.timeout, socket.error):
            pass
                
        arr[1] = arr[1] + 1
        prev_percent = arr[2]
        arr[2] = arr[1]/arr[0]
        if int(arr[2]*100) != int(prev_percent*100):
            print(int(arr[2]*100))

if __name__ == '__main__':
    #number = int(input('Number of processes: '))
    num_threads = 1000

    threads = []
    first_ip = int(IPAddress('172.16.0.0'))
    last_ip = int(IPAddress('172.21.0.255'))
    diap = last_ip-first_ip
    chunk_size = int(math.ceil((diap + 1)/num_threads))
    from_ip = first_ip
    
    counter = 0
    percent = 0
    arr = []
    arr.append(diap)
    arr.append(counter)
    arr.append(percent)
    
    for i in range(num_threads):
        to_ip = from_ip + chunk_size
        if to_ip > last_ip:
            to_ip = last_ip + 1
        threads.append(threading.Thread(target=port_scan, args=(from_ip,to_ip,arr,)))
        from_ip = to_ip
    
    
    st = datetime.now()
    
    for i in threads:
        i.start()
        
    for i in threads:
        i.join()
        
    nd = datetime.now()
    
    print ("Ex time: ", (nd - st).total_seconds())