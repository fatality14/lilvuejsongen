import socket
import threading
from datetime import datetime
from netaddr import *
import math

global_lock = threading.Lock()

#sock_type = socket.SOCK_STREAM
sock_type = socket.SOCK_DGRAM

def port_scan(from_port,to_port, arr):
    if from_port > to_port or from_port == to_port:
        return

    for i in range(from_port, to_port):
        host = str(IPAddress('82.179.190.68'))
        port = i
        try:
            s = socket.socket(socket.AF_INET, sock_type)
            s.settimeout(1)
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
    num_threads = 1

    threads = []
    first_port = 1194   
    last_port = first_port+1
    diap = last_port-first_port
    chunk_size = int(math.ceil((diap + 1)/num_threads))
    from_port = first_port
    
    counter = 0
    percent = 0
    arr = []
    arr.append(diap)
    arr.append(counter)
    arr.append(percent)
    
    for i in range(num_threads):
        to_port = from_port + chunk_size
        if to_port > last_port:
            to_port = last_port + 1
        threads.append(threading.Thread(target=port_scan, args=(from_port,to_port,arr,)))
        from_port = to_port
    
    
    st = datetime.now()
    
    for i in threads:
        i.start()
        
    for i in threads:
        i.join()
        
    nd = datetime.now()
    
    print ("Ex time: ", (nd - st).total_seconds())