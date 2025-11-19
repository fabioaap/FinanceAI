#!/usr/bin/env python3
"""
Script para atualizar o status das issues no GitHub Project #2
Fecha as issues concluídas (#33-39, #42) e adiciona comentários
"""

import os
import sys
import json
import subprocess
from typing import List

# Token fornecido pelo usuário
GITHUB_TOKEN = "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"
REPO = "fabioaap/FinanceAI"

# Issues que devem ser marcadas como concluídas
COMPLETED_ISSUES = [33, 34, 35, 36, 37, 38, 39, 42]

def run_gh_command(args: List[str], input_text: str = None) -> tuple:
    """Executa comando gh CLI e retorna (stdout, stderr, returncode)"""
    env = os.environ.copy()
    env['GH_TOKEN'] = GITHUB_TOKEN
    
    try:
        if input_text:
            # Se input_text for string, encode; se for bytes, use direto
            input_data = input_text.encode() if isinstance(input_text, str) else input_text
        else:
            input_data = None
            
        result = subprocess.run(
            ['gh'] + args,
            env=env,
            input=input_data,
            capture_output=True,
            text=True
        )
        return result.stdout, result.stderr, result.returncode
    except Exception as e:
        return "", str(e), 1

def close_issue(issue_number: int) -> bool:
    """Fecha uma issue e adiciona comentário de conclusão"""
    print(f"  Processando Issue #{issue_number}... ", end="", flush=True)
    
    # Fechar a issue
    comment = f"✅ Implementação concluída - 80% do backlog finalizado\n\nEsta issue foi marcada como concluída automaticamente pelo sistema de atualização do backlog."
    
    stdout, stderr, returncode = run_gh_command([
        'issue', 'close', str(issue_number),
        '--repo', REPO,
        '--comment', comment
    ])
    
    if returncode == 0:
        print("✅ Fechada")
        return True
    elif "already closed" in stderr.lower():
        print("ℹ️  Já estava fechada")
        return True
    else:
        print(f"❌ Erro: {stderr}")
        return False

def main():
    print("╔══════════════════════════════════════════════════════════════╗")
    print("║  FINANCEAI - Atualização do GitHub Project #2 Kanban        ║")
    print("╚══════════════════════════════════════════════════════════════╝")
    print()
    
    # Verificar se gh CLI está disponível
    stdout, stderr, returncode = run_gh_command(['--version'])
    if returncode != 0:
        print("❌ Erro: GitHub CLI (gh) não está instalado ou não está funcionando")
        print(f"   Detalhes: {stderr}")
        return 1
    
    print(f"✓ GitHub CLI detectado: {stdout.strip()}")
    print()
    
    # Autenticar
    print("🔐 Autenticando com GitHub...")
    stdout, stderr, returncode = run_gh_command(['auth', 'login', '--with-token'], input_text=GITHUB_TOKEN)
    if returncode != 0:
        print(f"❌ Erro na autenticação: {stderr}")
        return 1
    print("✓ Autenticado com sucesso")
    print()
    
    # Listar issues a serem fechadas
    print("📋 Issues para marcar como concluídas:")
    for issue in COMPLETED_ISSUES:
        print(f"   • Issue #{issue}")
    print()
    
    # Confirmar ação
    response = input("Deseja continuar? (s/n): ").strip().lower()
    if response not in ['s', 'sim', 'y', 'yes']:
        print("❌ Operação cancelada pelo usuário")
        return 0
    print()
    
    # Processar cada issue
    print("🚀 Fechando issues...")
    success_count = 0
    
    for issue in COMPLETED_ISSUES:
        if close_issue(issue):
            success_count += 1
    
    # Resultado final
    print()
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"✅ Atualização concluída!")
    print()
    print(f"📊 Resultados:")
    print(f"   ✅ {success_count}/{len(COMPLETED_ISSUES)} issues fechadas com sucesso")
    print(f"   📝 2 issues permanecem abertas (#40, #41) - Futuro")
    print()
    print("🔗 Verifique o projeto em:")
    print("   https://github.com/users/fabioaap/projects/2")
    print()
    print("💡 Nota: As issues foram fechadas. Se o GitHub Project #2 não")
    print("   sincronizar automaticamente, arraste-as manualmente para 'Done'.")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    
    return 0

if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\n❌ Operação cancelada pelo usuário (Ctrl+C)")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Erro inesperado: {e}")
        sys.exit(1)
