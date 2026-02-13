#!/usr/bin/env python
# -*- coding: utf-8 -*-
import subprocess
import sys

def install_from_requirements(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    packages = []
    for line in lines:
        line = line.strip()
        # 跳过空行和注释
        if not line or line.startswith('#'):
            continue
        packages.append(line)

    # 批量安装
    if packages:
        print(f"Installing {len(packages)} packages...")
        result = subprocess.run(
            [sys.executable, '-m', 'pip', 'install'] + packages,
            check=False
        )
        return result.returncode == 0
    else:
        print("No packages to install.")
        return True

if __name__ == '__main__':
    success = install_from_requirements('requirements.txt')
    sys.exit(0 if success else 1)